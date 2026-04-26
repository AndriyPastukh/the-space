import './FileUpload.css';

interface FileUploadProps {
    files: File[];
    onChange: (files: File[]) => void;
}

export default function FileUpload({ files, onChange }: FileUploadProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            onChange([...files, ...newFiles]);
            e.target.value = '';
        }
    };

    const handleRemove = (index: number) => {
        onChange(files.filter((_, i) => i !== index));
    };

    return (
        <div className="file-upload">
            <label className="file-upload-label">
                <input type="file" multiple onChange={handleChange} className="file-upload-input" />
                <span className="file-upload-btn">📎 Додати файли</span>
            </label>
            {files.length > 0 && (
                <ul className="file-list">
                    {files.map((file, i) => (
                        <li key={i} className="file-item">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                            <button type="button" className="file-remove-btn" onClick={() => handleRemove(i)}>×</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}