import { FileUploader } from "./FileUploader"

export const ConvertAudio = () => {
  function onFileUpload(params: any) {
    console.log(params)
  }

  return (
    <div className="w-full px-8 flex flex-col">
      <FileUploader onFileUpload={onFileUpload} />
    </div>
  )
}
