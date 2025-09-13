import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  Image, 
  Download, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Maximize2,
  Grid,
  List
} from "lucide-react";
import { format } from "date-fns";

interface Document {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  description?: string;
  is_primary: boolean;
  created_at: string;
  file_path: string;
}

interface DocumentViewerProps {
  documents: Document[];
  caseId: string;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return <Image className="h-4 w-4" />;
  }
  return <FileText className="h-4 w-4" />;
};

const getFileTypeColor = (fileType: string) => {
  if (fileType.startsWith('image/')) return 'bg-green-100 text-green-800';
  if (fileType === 'application/pdf') return 'bg-red-100 text-red-800';
  return 'bg-blue-100 text-blue-800';
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const DocumentViewer = ({ documents, caseId }: DocumentViewerProps) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [imageZoom, setImageZoom] = useState(100);
  const [imageRotation, setImageRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getSignedUrl = async (filePath: string) => {
    try {
      const { data } = await supabase.storage
        .from('case-documents')
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      return data?.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
  };

  const downloadDocument = async (document: Document) => {
    try {
      const signedUrl = await getSignedUrl(document.file_path);
      if (signedUrl) {
        const link = window.document.createElement('a');
        link.href = signedUrl;
        link.download = document.file_name;
        link.click();
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const openDocument = async (document: Document) => {
    setSelectedDocument(document);
    if (document.file_type.startsWith('image/')) {
      setImageZoom(100);
      setImageRotation(0);
    }
  };

  const resetImageTransform = () => {
    setImageZoom(100);
    setImageRotation(0);
  };

  const closeViewer = () => {
    setSelectedDocument(null);
    setIsFullscreen(false);
    resetImageTransform();
  };

  // Separate documents by type
  const imageDocuments = documents.filter(doc => doc.file_type.startsWith('image/'));
  const otherDocuments = documents.filter(doc => !doc.file_type.startsWith('image/'));
  const primaryDocuments = documents.filter(doc => doc.is_primary);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Case Documents ({documents.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Primary Documents */}
      {primaryDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Primary Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {primaryDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  viewMode={viewMode}
                  onOpen={openDocument}
                  onDownload={downloadDocument}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Documents */}
      {imageDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Images & Radiographs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {imageDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  viewMode={viewMode}
                  onOpen={openDocument}
                  onDownload={downloadDocument}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Documents */}
      {otherDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lab Results & Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {otherDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  viewMode={viewMode}
                  onOpen={openDocument}
                  onDownload={downloadDocument}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {documents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No documents uploaded for this case.</p>
          </CardContent>
        </Card>
      )}

      {/* Document Viewer Dialog */}
      <DocumentViewerDialog
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={closeViewer}
        zoom={imageZoom}
        rotation={imageRotation}
        onZoomChange={setImageZoom}
        onRotationChange={setImageRotation}
        isFullscreen={isFullscreen}
        onFullscreenChange={setIsFullscreen}
      />
    </div>
  );
};

interface DocumentCardProps {
  document: Document;
  viewMode: 'grid' | 'list';
  onOpen: (document: Document) => void;
  onDownload: (document: Document) => void;
}

const DocumentCard = ({ document, viewMode, onOpen, onDownload }: DocumentCardProps) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (document.file_type.startsWith('image/')) {
      getSignedUrl(document.file_path).then(url => {
        if (url) setThumbnailUrl(url);
      });
    }
  }, [document]);

  const getSignedUrl = async (filePath: string) => {
    try {
      const { data } = await supabase.storage
        .from('case-documents')
        .createSignedUrl(filePath, 3600);
      return data?.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
        <div className="flex items-center gap-3">
          {getFileIcon(document.file_type)}
          <div>
            <div className="font-medium">{document.file_name}</div>
            <div className="text-sm text-muted-foreground">
              {formatFileSize(document.file_size)} • {format(new Date(document.created_at), 'MMM d, yyyy')}
            </div>
            {document.description && (
              <div className="text-xs text-muted-foreground mt-1">{document.description}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {document.is_primary && <Badge variant="secondary">Primary</Badge>}
          <Badge className={getFileTypeColor(document.file_type)}>
            {document.file_type.split('/')[1].toUpperCase()}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => onOpen(document)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDownload(document)}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square bg-muted relative">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={document.file_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {getFileIcon(document.file_type)}
          </div>
        )}
        {document.is_primary && (
          <Badge variant="secondary" className="absolute top-2 right-2">
            Primary
          </Badge>
        )}
      </div>
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="font-medium text-sm truncate">{document.file_name}</div>
          <div className="flex items-center justify-between">
            <Badge className={getFileTypeColor(document.file_type)}>
              {document.file_type.split('/')[1].toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatFileSize(document.file_size)}
            </span>
          </div>
          {document.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{document.description}</p>
          )}
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => onOpen(document)} className="flex-1">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDownload(document)}>
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface DocumentViewerDialogProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  zoom: number;
  rotation: number;
  onZoomChange: (zoom: number) => void;
  onRotationChange: (rotation: number) => void;
  isFullscreen: boolean;
  onFullscreenChange: (fullscreen: boolean) => void;
}

const DocumentViewerDialog = ({
  document,
  isOpen,
  onClose,
  zoom,
  rotation,
  onZoomChange,
  onRotationChange,
  isFullscreen,
  onFullscreenChange
}: DocumentViewerDialogProps) => {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  useEffect(() => {
    if (document) {
      getSignedUrl(document.file_path).then(url => {
        if (url) setDocumentUrl(url);
      });
    }
  }, [document]);

  const getSignedUrl = async (filePath: string) => {
    try {
      const { data } = await supabase.storage
        .from('case-documents')
        .createSignedUrl(filePath, 3600);
      return data?.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
  };

  if (!document) return null;

  const isImage = document.file_type.startsWith('image/');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl ${isFullscreen ? 'w-screen h-screen max-w-none' : ''}`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{document.file_name}</DialogTitle>
            <div className="flex items-center gap-2">
              {isImage && (
                <>
                  <Button variant="outline" size="sm" onClick={() => onZoomChange(Math.max(25, zoom - 25))}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">{zoom}%</span>
                  <Button variant="outline" size="sm" onClick={() => onZoomChange(Math.min(400, zoom + 25))}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onRotationChange((rotation + 90) % 360)}>
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => onFullscreenChange(!isFullscreen)}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 flex items-center justify-center overflow-auto">
          {documentUrl && isImage ? (
            <img
              src={documentUrl}
              alt={document.file_name}
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease-in-out'
              }}
              className="max-w-full max-h-full object-contain"
            />
          ) : documentUrl && document.file_type === 'application/pdf' ? (
            <iframe
              src={documentUrl}
              className="w-full h-96"
              title={document.file_name}
            />
          ) : (
            <div className="text-center p-8">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Preview not available for this file type.</p>
              <Button className="mt-4" onClick={() => window.open(documentUrl || '', '_blank')}>
                Open in New Tab
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
