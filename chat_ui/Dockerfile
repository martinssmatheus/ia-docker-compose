FROM python:3.10-slim
WORKDIR /app
COPY chat_ui.py /app
RUN pip install gradio requests
CMD ["python", "chat_ui.py"]