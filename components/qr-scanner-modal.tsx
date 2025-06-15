// (Remove the inline module declaration comment from this file)

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import QrReader from 'react-qr-reader'

interface QRScannerModalProps {
  open: boolean
  onClose: () => void
  onScan: (result: string) => void
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  open,
  onClose,
  onScan
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    'environment'
  )

  // Loading fallback
  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError(null)
    const timeout = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timeout)
  }, [open])

  // Get camera devices
  useEffect(() => {
    if (!open) return
    navigator.mediaDevices
      .enumerateDevices()
      .then(devices => {
        const videoDevices = devices.filter(d => d.kind === 'videoinput')
        setDevices(videoDevices)
      })
      .catch(() => setDevices([]))
  }, [open])

  // Handle camera selection
  useEffect(() => {
    if (!open) return
    if (devices.length === 1) {
      setFacingMode('environment')
    }
  }, [devices, open])

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="flex flex-col items-center !opacity-100 !scale-100 !visible">
        <VisuallyHidden asChild>
          <DialogTitle>Scan a QR code with your camera</DialogTitle>
        </VisuallyHidden>

        {devices.length > 1 && (
          <div className="mb-2 w-full">
            <label
              htmlFor="camera-select"
              className="block text-xs font-bold mb-1 text-muted-foreground"
            >
              Select Camera
            </label>
            <select
              id="camera-select"
              className="w-full rounded border px-2 py-1 text-xs"
              value={facingMode}
              onChange={e =>
                setFacingMode(e.target.value as 'user' | 'environment')
              }
            >
              <option value="environment">Back Camera</option>
              <option value="user">Front Camera</option>
            </select>
          </div>
        )}

        {error ? (
          <div className="text-destructive text-center my-4">{error}</div>
        ) : (
          <div className="w-[500px] h-[500px] flex items-center justify-center relative">
            <QrReader
              key={facingMode}
              delay={500}
              onScan={(data: any) => {
                if (data) {
                  setLoading(false)
                  onScan(data)
                  onClose()
                }
              }}
              onError={(err: any) => {
                setLoading(false)
                if (err.name === 'NotAllowedError') {
                  setError(
                    'Camera access was denied. Please allow camera permissions in your browser settings.'
                  )
                } else if (err.name === 'NotFoundError') {
                  setError(
                    'No camera device found. Please connect a camera and try again.'
                  )
                } else if (err.name === 'NotReadableError') {
                  setError('Camera is already in use by another application.')
                } else {
                  setError('Camera error: ' + err.message)
                }
              }}
              facingMode={facingMode}
              style={{ width: 500, height: 500 }}
            />
            {loading && (
              <div className="absolute flex flex-col items-center justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-primary mb-2"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                <div className="text-xs text-muted-foreground">
                  Initializing camera...
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-2 text-xs text-muted-foreground text-center">
          Point your camera at a QR code
        </div>
      </DialogContent>
    </Dialog>
  )
}
