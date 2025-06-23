import requests

def perguntar_ia(pergunta):
    response = requests.post("http://ollama:11434/api/generate", json={
        "model": "mistral",
        "prompt": pergunta
    })

    if response.status_code == 200:
        return response.json().get("response", "")
    else:
        return "Erro ao obter resposta da IA."
