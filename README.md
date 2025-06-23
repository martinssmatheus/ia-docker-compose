# 🤖 Canal IA - Assistente Offline com LLM + GPU + FastAPI

Este projeto roda uma IA local com o modelo **LLaMA 3** utilizando [Ollama](https://ollama.com/) com aceleração por **GPU (NVIDIA)**, acessível por uma API FastAPI. Ideal para rodar em ambiente corporativo.
## ⚙️ Tecnologias Utilizadas

- [FastAPI](https://fastapi.tiangolo.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Ollama](https://ollama.com/) (LLM offline)
- Modelo: `llama3`
- GPU: Suporte via `nvidia-docker`
- Host: Ubuntu 24.04 com NVIDIA 4070

---

## 📁 Estrutura do Projeto

noe/
├── app/
│ └── main.py
| └── ai.py
│
├── requirements.txt # Dependências Python
├── Dockerfile # API FastAPI
├── docker-compose.yml # Orquestração


---

## 🚀 Como subir o projeto

### Pré-requisitos

- Docker + Docker Compose
- Driver NVIDIA + `nvidia-docker` instalado (confira com `nvidia-smi` e `docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi`)

### Passos

# Suba os containers com build e GPU
docker compose up --build -d

# Para atualizar o projeto, rode o script deploy.sh
./deploy.sh

# Rodar dentro do container ollama
- ollama pull llama3
- ollama pull deepseek-r1
