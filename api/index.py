from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.logger import logger
import os
import sys

from pydantic import BaseModel

# Define a Pydantic model for the request body
class ChatRequest(BaseModel):
    message: str


# Add the `api` directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


from api.processor.chatbot import ChatbotManager
from processor.embeddings import EmbeddingsManager  # Import the EmbeddingsManager
embeddings_manager = EmbeddingsManager(
    model_name="BAAI/bge-small-en",
    device="cpu",
    encode_kwargs={"normalize_embeddings": True},
    qdrant_url="http://localhost:6333",
    collection_name="vector_db" )

chatbot_manager = None  # This will hold the ChatbotManager instance


### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with your frontend's URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}

# Define the upload directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    global chatbot_manager  # Use the global variable to store the ChatbotManager instance
    print('got upload request ')
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb") as f:
        f.write(await file.read())

    # create embeddings, store in qdrant
    try:

        result = embeddings_manager.create_embeddings(file_location)
        print(result)

        # Initialize the ChatbotManager after embeddings are created
        chatbot_manager = ChatbotManager(
            model_name="BAAI/bge-small-en",
            device="cpu",
            encode_kwargs={"normalize_embeddings": True},
            llm_model="llama3.2:3b",
            llm_temperature=0.7,
            qdrant_url="http://localhost:6333",
            collection_name="vector_db"
        )
        print("ChatbotManager initialized successfully.")

    except Exception as e:
        print(f"Error creating embeddings: {e}")
        return {"message": "Failed to process the file", "error": str(e)}
    

    return {"message": "File uploaded and processed successfully", "filePath": file_location, "result": result}


@app.post("/api/chat")
async def chat_with_llm(request: ChatRequest):
    global chatbot_manager  # Use the global ChatbotManager instance

    """
    Endpoint to interact with the LLM chatbot.

    Args:
        message (str): The user's input message.

    Returns:
        dict: The chatbot's response.
    """
    try:

        # Ensure the ChatbotManager is initialized
        if chatbot_manager is None:
            raise HTTPException(status_code=400, detail="ChatbotManager is not initialized. Please upload a document first.")
        

        # Extract the message from the request
        message = request.message


        # Get the chatbot's response
        chatbot_response = chatbot_manager.get_response(message)

        return {"message": chatbot_response}

    except Exception as e:
        logger.error(f"Error processing chat message: {e}")
        return {"error": "Failed to process the chat message", "details": str(e)}