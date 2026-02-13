import { useRef, useState } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Upload, X, File } from 'lucide-react'

interface FileUploadProps {
  value?: string
  onChange: (url: string) => void
  accept?: string
  label?: string
  description?: string
}

export function FileUpload({ value, onChange, accept, label, description }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // For now, we'll use a placeholder URL
      // In production, this would upload to S3 or similar storage
      // TODO: Implement actual file upload to storage service
      const placeholderUrl = URL.createObjectURL(file)
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      onChange(placeholderUrl)
    } catch (error) {
      console.error('File upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      
      {value ? (
        <div className="flex items-center gap-2 p-3 border rounded-lg">
          <File className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{value}</p>
            <p className="text-xs text-muted-foreground">Click to view</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id={`file-upload-${label}`}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
      )}
      
      {value && (
        <div className="text-xs text-muted-foreground">
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            View uploaded file
          </a>
        </div>
      )}
    </div>
  )
}
