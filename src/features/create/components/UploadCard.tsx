"use client";

import { useCallback, useState } from "react";
import { CloudUpload, ImagePlus } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type UploadedFile = {
  name: string;
  size: number;
};

const TARGET_EDITOR_ROUTE = "/story/story-1/edit?from=upload";

export function UploadCard() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const router = useRouter();

  const persistImage = useCallback(async (file: File) => {
    const reader = new FileReader();

    const dataUrl: string = await new Promise((resolve, reject) => {
      reader.onerror = () => reject(new Error("读取文件失败"));
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("无法解析图片数据"));
        }
      };
      reader.readAsDataURL(file);
    });

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "story-board:pending-frame",
        JSON.stringify({
          image: dataUrl,
          prompt: `Uploaded image: ${file.name}`,
          source: "upload"
        })
      );
    }
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) {
        return;
      }

      const file = acceptedFiles[0];
      setFiles([
        {
          name: file.name,
          size: file.size
        }
      ]);

      try {
        await persistImage(file);
        toast.success("图片已上传，正在跳转编辑器。");
        router.push(TARGET_EDITOR_ROUTE);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        toast.error(message);
      }
    },
    [persistImage, router]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": []
    },
    multiple: false,
    onDrop
  });

  return (
    <div className="flex h-full flex-col gap-4 rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">上传图片</h2>
      <div
        {...getRootProps()}
        className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-neutral-500 transition hover:border-primary/60"
      >
        <input {...getInputProps()} />
        <CloudUpload className="h-10 w-10 text-primary" />
        {isDragActive ? (
          <p>松开即可上传图片。</p>
        ) : (
          <p>拖拽或点击选择一张首帧图像。</p>
        )}
      </div>
      <Button variant="secondary" className="gap-2">
        <ImagePlus className="h-4 w-4 text-primary" />
        从图库选择
      </Button>
      <ul className="space-y-2 text-sm text-neutral-500">
        {files.map((file) => (
          <li key={file.name} className="flex justify-between rounded-2xl bg-neutral-100 px-4 py-2">
            <span>{file.name}</span>
            <span>{(file.size / 1024).toFixed(1)} KB</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
