import wave
import struct
import numpy as np
import os
import math
from pydub import AudioSegment
import speech_recognition as sr
import ffmpeg 
import io
import requests

def handler(event, context):
    print(event)
    presigned_url = event.get('arguments', {}).get('presignedUrl')
    print(f"presigned_url: {presigned_url}")
    # GETリクエストを使用してファイルをダウンロード
    audio_file = download_file_from_presigned_url(presigned_url)
    print(f"audio_file: {audio_file}")
    text = wav_to_text(audio_file)
    print(f"text: {text}")
    return {
        "text": text
    }

def download_file_from_presigned_url(presigned_url):
    try:
        response = requests.get(presigned_url, stream=True)
        
        if response.status_code == 200:
            return io.BytesIO(response.content)
        else:
            print(f'Failed to download file: {response.status_code} - {response.reason}')
            return None
    
    except requests.RequestException as error:
        print(f'Error downloading file: {error}')
        return None



#音声ファイル（wav）から文字へ変換
def wav_to_text(wavfile):
  r = sr.Recognizer()

  #音声ファイルを指定 
  with sr.AudioFile(wavfile) as source:
      audio = r.record(source)
  
  try:
      #日本語変換
      text = r.recognize_google(audio, language='ja-JP')
      return text
              
  # 以下は認識できなかったときに止まらないように。
  except sr.UnknownValueError:
      print("could not understand audio")
  except sr.RequestError as e:
      print("Could not request results from Google Speech Recognition service; {0}".format(e))