import gradio as gr
import requests

API_URL = "http://ia_api:8000/chat"  # app é o nome do container FastAPI no compose

def conversar(pergunta):
    resposta = requests.post(API_URL, json={"mensagem": pergunta})
    if resposta.status_code == 200:
        return resposta.json().get("resposta")
    else:
        return "Erro na API."

iface = gr.Interface(
    fn=conversar,
    inputs="text",
    outputs="text",
    title="Chat com IA",
    description="Interaja com a IA do projeto."
)

iface.launch(server_name="0.0.0.0", server_port=7860)