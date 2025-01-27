import './KeywordsPanel.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare, faPlusCircle, faPlusSquare, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { DeleteProperty } from '../../pages/Annotation';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useState } from 'react';

export interface KeywordsPanelProps {
    path: string;
    keywords: string[];
    onChange: (path: string, value: any) => void;
}

const KeywordsPanel: React.FC<KeywordsPanelProps> = ({
    path,
    keywords,
    onChange
}) => {
    const [open, setOpen] = useState(false);
    const [collapse, setCollapse] = useState(false);
    
    const handleClose = ()=> {
        setOpen(false);
    }

    return (
        <div className="KeywordsPanel">
            <div className="KeywordsPanel-title">
                <div>Keywords</div>
                <FontAwesomeIcon 
                    icon={collapse && faPlusSquare || faMinusSquare} 
                    size="lg" 
                    onClick={()=> setCollapse(!collapse)} 
                />
            </div>
            <div 
                className="KeywordsPanel-keywords"
                hidden={collapse}
            >
                {
                    keywords.map((keyword, index) =>
                        <div
                            key={keyword}
                            className="KeywordsPanel-keyword"
                        >
                            {keyword}
                            <FontAwesomeIcon
                                onClick={() => onChange(`${path}.${index}`, DeleteProperty)}
                                icon={faXmarkCircle}
                                size="lg"
                            />
                        </div>
                    )
                }
                <FontAwesomeIcon
                    className="KeywordsPanel-add"
                    icon={faPlusCircle}
                    size="lg"
                    onClick={()=> setOpen(true)}
                />
            </div>
            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries((formData as any).entries());
                        if (formJson.keyword) {
                            onChange(`${path}.${keywords.length}`, formJson.keyword)
                        }
                        handleClose();
                    },
                }}
            >
                <DialogTitle>Add Keyword</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        name="keyword"
                        label="Keyword"
                        type="text"
                        fullWidth
                        variant="standard"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Add Keyword</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
export default KeywordsPanel;