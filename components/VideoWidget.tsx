import { useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Camera } from 'lucide-react'

const VideoWidget = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null)

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
        const dataUrl = canvasRef.current.toDataURL('image/png')
        setSnapshotUrl(dataUrl)
      }
    }
  }

  const exportSnapshot = () => {
    if (snapshotUrl) {
      const link = document.createElement('a')
      link.href = snapshotUrl
      link.download = 'snapshot.png'
      link.click()
    }
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Surface View</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-gray-200 flex items-center justify-center relative">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/placeholder-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* <Button
            className="absolute bottom-4 right-4"
            onClick={takeSnapshot}
          >
            <Camera className="mr-2 h-4 w-4" />
            Take Snapshot
          </Button> */}
        </div>
        {/* <canvas ref={canvasRef} className="hidden" width="640" height="360" />
        {snapshotUrl && (
          <div className="mt-4">
            <img src={snapshotUrl} alt="Snapshot" className="mb-2 rounded-md" />
            <Button onClick={exportSnapshot}>Export Snapshot</Button>
          </div>
        )} */}
      </CardContent>
    </Card>
  )
}

export default VideoWidget

