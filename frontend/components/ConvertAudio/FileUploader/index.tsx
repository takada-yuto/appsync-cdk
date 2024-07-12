import { FC, useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUpload } from "@fortawesome/free-solid-svg-icons"
import {
  PresignedUrl,
  useAudToTxtMutation,
  useCreateDownloadPresignedUrlMutation,
  useCreateUploadPresignedUrlMutation,
} from "@/graphql/generated/generated-types"
import { v4 as uuid } from "uuid"

type Props = {
  onFileUpload: ({
    data,
    file_name,
  }: {
    data: string
    file_name: string
  }) => void
}

export const FileUploader: FC<Props> = ({ onFileUpload }) => {
  const [url, setUrl] = useState<string | undefined>(undefined)
  const [file, setFile] = useState<File | null>(null)
  const [createUploadPresignedUrl] = useCreateUploadPresignedUrlMutation()
  const [createDownloadPresignedUrl] = useCreateDownloadPresignedUrlMutation()
  const [audToTxt] = useAudToTxtMutation()
  const uploadFile = async (
    putData: PresignedUrl,
    getData: PresignedUrl,
    file: File
  ) => {
    console.log(putData)
    console.log(file)
    const fileUploadResponse = await fetch(putData.presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    })
    console.log(fileUploadResponse)
    console.log(getData.presignedUrl)
    const { data: audData } = await audToTxt({
      variables: { presignedUrl: getData.presignedUrl },
    })
    console.log(audData)
    // const fileDownloadResponse = await fetch(getData.presignedUrl, {
    //   method: "GET",
    //   headers: {
    //     "Content-Type": file.type,
    //   },
    // })
    // console.log(fileDownloadResponse)
    // const blob = await fileDownloadResponse.blob()
    // console.log(blob)
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      console.log(acceptedFiles)
      console.log(file.name)
      const guid = uuid()
      try {
        const { data: putData } = await createUploadPresignedUrl({
          variables: { filename: file.name, id: guid },
        })

        const { data: getData } = await createDownloadPresignedUrl({
          variables: { filename: file.name, id: guid },
        })
        console.log(putData)
        console.log(getData)
        await uploadFile(
          putData!.createUploadPresignedUrl!,
          getData!.createDownloadPresignedUrl!,
          file
        )
      } catch (error) {
        console.log(error)
      }
    },
    [onFileUpload]
  )

  // useEffect(() => {
  //   const uploadFile = async () => {
  //     if (url && file) {
  //       // URLとファイルが設定されている場合に実行
  //       try {
  //         const fileUploadResponse = await fetch(url, {
  //           method: "PUT",
  //           body: file, // FormDataではなくファイルだけをアップロード
  //           headers: {
  //             "Access-Control-Allow-Origin": "*",
  //             "Content-Type": file.type, // 必要に応じてコンテンツタイプを設定
  //           },
  //         })

  //         if (fileUploadResponse.ok) {
  //           console.log("File uploaded successfully")
  //         } else {
  //           console.error("File upload failed", fileUploadResponse.statusText)
  //         }
  //       } catch (error) {
  //         console.error("Error uploading file:", error)
  //       }
  //     }
  //   }
  //   uploadFile()
  // }, [url, file])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div
      {...getRootProps()}
      style={{
        border: "dashed",
        backgroundColor: "white",
        height: "200px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "0 20px",
      }}
    >
      <input {...getInputProps()} />
      {/* <FontAwesomeIcon icon={faUpload} style={{ fontSize: 50 }} /> */}
      {isDragActive ? (
        <p className="text-center p-3 m-0">ここにファイルをドロップ</p>
      ) : (
        <p className="text-center p-3 m-0">
          ここにファイルをドロップ
          <br />
          またはクリックでファイルを選択
        </p>
      )}
    </div>
  )
}
