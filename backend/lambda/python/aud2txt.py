import wave
import struct
import numpy as np
import os
import math
import speech_recognition as sr
import ffmpeg 

wav_file = 'sampleTokyo.wav'
out_file = '/out.txt'

def handler(event, context):
  return {
      'statusCode': 200,
      'body': 'This is a foo!'
  }

#音声ファイル（wav）から文字へ変換
def wav_to_text(wavfile):
  r = sr.Recognizer()

  #音声ファイルを指定 
  with sr.AudioFile(wavfile) as source:
      audio = r.record(source)
  
  try:
      #日本語変換
      text = r.recognize_google(audio, language='ja-JP')
      print(text)
              
      f = open(out_file, 'a')
      f.write(text)
      f.close
  # 以下は認識できなかったときに止まらないように。
  except sr.UnknownValueError:
      print("could not understand audio")
  except sr.RequestError as e:
      print("Could not request results from Google Speech Recognition service; {0}".format(e))

wav_to_text(wav_file)
