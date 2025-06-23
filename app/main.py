from fastapi import FastAPI, Request
from ia import perguntar_ia

app = FastAPI()

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    pergunta = data.get("pergunta")
    resposta = perguntar_ia(pergunta)
    return {"resposta": resposta}
