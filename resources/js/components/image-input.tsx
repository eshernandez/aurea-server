import { useState, useRef, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Stack,
    InputAdornment,
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Link as LinkIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';

type Props = {
    value: string | File | null;
    onChange: (value: string | File | null) => void;
    error?: string;
    label?: string;
    helperText?: string;
};

export default function ImageInput({ value, onChange, error, label = 'Imagen', helperText }: Props) {
    const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
    const [preview, setPreview] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Determinar el modo inicial basado en el valor
    useEffect(() => {
        if (value instanceof File) {
            setImageMode('upload');
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(value);
            setUploadedFile(value);
        } else if (typeof value === 'string' && value) {
            setImageMode('url');
            setPreview(value);
        } else {
            setPreview(null);
        }
    }, [value]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar que sea una imagen
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecciona un archivo de imagen válido.');
                return;
            }

            // Validar tamaño (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('La imagen no debe superar los 5MB.');
                return;
            }

            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
                setUploadedFile(file);
                onChange(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setPreview(url || null);
        onChange(url);
        setUploadedFile(null);
    };

    const handleModeChange = (mode: 'url' | 'upload') => {
        setImageMode(mode);
        if (mode === 'url') {
            // Si cambiamos a URL, limpiar el archivo
            if (uploadedFile) {
                setUploadedFile(null);
                onChange('');
            }
        } else {
            // Si cambiamos a upload, limpiar la URL si existe
            if (typeof value === 'string' && value) {
                onChange('');
            }
        }
    };

    const handleRemove = () => {
        onChange(null);
        setPreview(null);
        setUploadedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Box>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button
                    variant={imageMode === 'url' ? 'contained' : 'outlined'}
                    startIcon={<LinkIcon />}
                    onClick={() => handleModeChange('url')}
                    sx={{ textTransform: 'none' }}
                >
                    Pegar URL
                </Button>
                <Button
                    variant={imageMode === 'upload' ? 'contained' : 'outlined'}
                    startIcon={<CloudUploadIcon />}
                    onClick={() => handleModeChange('upload')}
                    sx={{ textTransform: 'none' }}
                >
                    Subir Imagen
                </Button>
            </Stack>

            {imageMode === 'url' ? (
                <TextField
                    label={label}
                    type="url"
                    value={typeof value === 'string' ? value : ''}
                    onChange={handleUrlChange}
                    placeholder="https://example.com/image.jpg"
                    error={!!error}
                    helperText={error || helperText}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <LinkIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            ) : (
                <Box>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        onClick={handleUploadClick}
                        fullWidth
                        sx={{
                            textTransform: 'none',
                            py: 2,
                            borderStyle: 'dashed',
                        }}
                    >
                        {uploadedFile ? uploadedFile.name : 'Seleccionar Imagen'}
                    </Button>
                    {error && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                            {error}
                        </Typography>
                    )}
                    {helperText && !error && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {helperText}
                        </Typography>
                    )}
                </Box>
            )}

            {preview && (
                <Paper
                    elevation={2}
                    sx={{
                        mt: 2,
                        p: 2,
                        position: 'relative',
                        display: 'inline-block',
                    }}
                >
                    <Box
                        component="img"
                        src={preview}
                        alt="Preview"
                        sx={{
                            maxWidth: '100%',
                            maxHeight: 200,
                            display: 'block',
                            borderRadius: 1,
                        }}
                    />
                    <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleRemove}
                        sx={{
                            mt: 1,
                            textTransform: 'none',
                        }}
                    >
                        Eliminar
                    </Button>
                </Paper>
            )}
        </Box>
    );
}
