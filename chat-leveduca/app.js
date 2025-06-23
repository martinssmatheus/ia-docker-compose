var app = require("http").createServer(resposta);
var fs = require("fs");
var io = require("socket.io")(app);
var axios = require("axios");

var usuarios = [];
var mensagens = [];

app.listen(80);
console.log("Aplicação está em execução...");

var url = "https://backend-prod1.leveduca.com.br:4346/api/me";
var url_ia = "http://10.100.100.29:11434";

function resposta (req, res) {
    var arquivo = "";

    if(req.url.split('?')[0] == "/") {
        arquivo = __dirname + "/index.html";
    } else {
        arquivo = __dirname + req.url;
    }

    fs.readFile(
        arquivo,
        function (err, data) {
            if(err) {
                res.writeHead(404);
                return res.end("Página não encontrada");
            }

            res.writeHead(200);
            res.end(data);
        } 
    );
}

io.on(
    "connection", 
    function(socket) {
        socket.on(
            "enviar mensagem", 
            function(entrada, callback) {
                entrada.mensagem = {
                    avatar: socket.usuario.foto,
                    mensagem: entrada.mensagem,
                    horario: pegarDataAtual(),
                    apelido: socket.apelido
                };

                mensagens[entrada.sala].push(
                    {
                        role: "user",
                        content: entrada.mensagem.mensagem
                    }
                );

                io.sockets.emit("atualizar mensagens" + entrada.sala, entrada.mensagem);
                
                axios({
                    method: "post",
                    url: url_ia + "/api/chat",
                    data: {
                        model: entrada.modelo,
                        messages: mensagens[entrada.sala],
                        stream: false
                    }
                })
                .then(function (response) {
                    var split = response.data.message.content.split('</think>')
                    var mensagemFormatada = split[split.length-1]

                    entrada.mensagem = {
                        avatar: "https://noe-leveduca.s3.us-west-2.amazonaws.com/imagens/noe.jpeg",
                        mensagem: mensagemFormatada,
                        horario: pegarDataAtual(),
                        apelido: "Noézinho (" + entrada.modelo + ")",
                        ia: true
                    };

                    mensagens[entrada.sala].push(
                        {
                            role: "assistant",
                            content: mensagemFormatada
                        }
                    );
                    
                    io.sockets.emit("atualizar mensagens" + entrada.sala, entrada.mensagem);
                })
                .catch(function(err) {
                    console.log(err);
                    
                    entrada.mensagem = {
                        avatar: "https://noe-leveduca.s3.us-west-2.amazonaws.com/imagens/noe.jpeg",
                        mensagem: "Foi mal meu chapa, deu erro na IA.",
                        horario: pegarDataAtual(),
                        apelido: "Noézinho 😔"
                    };
                    return;
                });

                callback();
            }
        );

        socket.on(
            "entrar", 
            function(usuario, callback) {
                if(mensagens[usuario.sala] == undefined) {
                    adicionarPromptsDoSistema(usuario.sala);
                }

                axios({
                    method: "get",
                    url: url,
                    headers: {
                        "Authorization": "Bearer " + usuario.token
                    }
                })
                .then(function (response) {
                    if(usuarios[usuario.sala] == undefined) {
                        usuarios[usuario.sala] = [];
                    }

                    socket.usuario = response.data.usuario;
                    socket.apelido = response.data.usuario.nome;
                    socket.sala = usuario.sala;

                    usuarios[usuario.sala][response.data.usuario.nome] = socket;

                    io.sockets.emit("atualizar usuarios" + usuario.sala, Object.keys(usuarios[usuario.sala]));
                    io.sockets.emit("atualizar mensagens" + usuario.sala, {
                        avatar: response.data.usuario.foto,
                        mensagem: " entrou no chat.",
                        horario: pegarDataAtual(),
                        apelido: response.data.usuario.nome
                    });

                    callback(true);
                })
                .catch(function() {
                    callback(false);
                    return;
                });
            }
        );

        socket.on(
            "disconnect", 
            function(){
                if(socket.apelido != null) {
                    var mensagem = {
                        avatar: socket.usuario.foto,
                        mensagem: "saiu do chat.",
                        horario: pegarDataAtual(),
                        apelido: socket.apelido
                    };
                    
                    delete usuarios[socket.sala][socket.apelido];
                    
                    io.sockets.emit("atualizar usuarios" + socket.sala, Object.keys(usuarios));
                    io.sockets.emit("atualizar mensagens" + socket.sala, mensagem);
                }
            }
        );
    }
);

function pegarDataAtual()
{
    var dataAtual = new Date();
    var hora = (dataAtual.getHours() < 10 ? "0" : "") + dataAtual.getHours();
    var minuto = (dataAtual.getMinutes() < 10 ? "0" : "") + dataAtual.getMinutes();

    var dataFormatada = hora + ":" + minuto;
    return dataFormatada;
}

function adicionarPromptsDoSistema(sala)
{
    mensagens[sala] = [];

    mensagens[sala].push(
        {
            role: "system",
            content: "Responda sempre em português."
        }
    );
    
    mensagens[sala].push(
        {
            role: "system",
            content: "Seu nome é \"Noézinho\"."
        }
    );
}