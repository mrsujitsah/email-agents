import os
import time
import speech_recognition as sr
from gtts import gTTS
from langchain_ollama import ChatOllama

os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = "hide"
import pygame

pygame.mixer.init()

def speak(text):
    """Converts text to speech using unique filenames to prevent Windows file locking bugs."""
    print(f"\nAssistant: {text}\n")
    
    # Create a unique filename using the current timestamp
    filename = f"response_{int(time.time())}.mp3"
    
    try:
        tts = gTTS(text=text, lang='en', tld='com') 
        tts.save(filename)
        
        pygame.mixer.music.load(filename)
        pygame.mixer.music.play()
        
        while pygame.mixer.music.get_busy():
            time.sleep(0.1)
            
        pygame.mixer.music.unload()
        
        # Clean up the file immediately after playing
        if os.path.exists(filename):
            os.remove(filename)
            
    except Exception as e:
        # Fallback if audio fails: print text and ensure mixer is unloaded
        pygame.mixer.music.unload()
        print(f"[Audio Playback System Notice]: {text}")

def safe_exit():
    """Safely shuts down the audio mixer before exiting."""
    print("\nShutting down safely...")
    try:
        pygame.mixer.music.stop()
        pygame.mixer.music.unload()
    except:
        pass
    
    # Quick clean up of any stray mp3 files left over in the folder
    for file in os.listdir('.'):
        if file.startswith("response_") and file.endswith(".mp3"):
            try:
                os.remove(file)
            except:
                pass

# 1. Configure Local Ollama for Deeper Reasoning
print("Loading qwen2.5:3b from Ollama...")
llm = ChatOllama(
    model="qwen2.5:3b",
    temperature=0.7,
    num_ctx=4096,      
    num_predict=400    
)

# 2. Setup High-Sensitivity Voice Recognition
recognizer = sr.Recognizer()
recognizer.energy_threshold = 300       
recognizer.dynamic_energy_threshold = True 
recognizer.pause_threshold = 1.2        

microphone = sr.Microphone()

system_context = (
    "You are an expert, highly knowledgeable educator and voice assistant. "
    "When asked a question, provide a comprehensive, detailed, and engaging explanation. "
    "Break down complex topics into clear steps or concepts. Do not give short answers."
)

print("\n=== Advanced Local Voice Assistant Initialized ===")
speak("Hello! I am ready. Ask me any complex question, and I will explain it in detail.")

# Main Sequential Loop
while True:
    try:
        with microphone as source:
            print("\n[STEP 1] Calibrating microphone... (Keep quiet for a split second)")
            recognizer.adjust_for_ambient_noise(source, duration=0.8)
            
            print("\n[STEP 2] LISTENING... (Speak your question now)")
            audio = recognizer.listen(source, timeout=10, phrase_time_limit=15)
            
            print("\n[STEP 3] PROCESSING AUDIO...")

        user_text = recognizer.recognize_google(audio)
        print(f"You said: \"{user_text}\"")

        if "exit" in user_text.lower() or "stop" in user_text.lower():
            speak("Goodbye!")
            safe_exit()
            break

        print("\n[STEP 4] THINKING...")
        prompt = f"{system_context}\nUser: {user_text}\nAssistant:"
        response = llm.invoke(prompt)
        
        print("\n[STEP 5] SPEAKING...")
        speak(response.content)

    except sr.WaitTimeoutError:
        continue
    except sr.UnknownValueError:
        print("System: Audio capture failed or words were muffled. Please speak closer to your microphone.")
    except sr.RequestError as e:
        print(f"System: Network error with speech recognition api; {e}")
    except (KeyboardInterrupt, SystemExit):
        safe_exit()
        print("Goodbye!")
        break
