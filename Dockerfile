FROM python:3.11-slim

# Set working directory
WORKDIR /app/server/project

# Copy requirements file and install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy the rest of your application code
COPY . /app/

# Expose the port that your app will run on (Heroku uses $PORT)
EXPOSE 5000

# Set the default command to start your application
CMD ["sh", "-c", "uvicorn app:app --host=0.0.0.0 --port ${PORT:-5000}"]