import { useState, useMemo } from 'react';
import {
    List,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    TextField,
    Box,
    InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { ConsentForm } from '@/types/ConsentForm';

interface Props {
    forms: ConsentForm[];
    onSelect: (form: ConsentForm) => void;
    selectedId?: string;
}

const ConsentFormList = ({ forms, onSelect, selectedId }: Props) => {
    const [search, setSearch] = useState('');

    const filteredForms = useMemo(() => {
        return forms.filter((form) =>
            form.Title.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, forms]);

    return (
        <Box>
            {/* 🔍 Search Input with Icon */}
            <TextField
                size="small"
                fullWidth
                variant="outlined"
                placeholder="Filter document type"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 1 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                        </InputAdornment>
                    ),
                }}
            />

            {/* 📋 Filtered Form List */}
            <List>
                {filteredForms.map((form) => {
                    const isActive = form.FormID === selectedId;
                    return (
                        // <ListItemButton
                        //     key={form.FormID}
                        //     selected={isActive}
                        //     onClick={() => onSelect(form)}
                        //     sx={{
                        //         borderRadius: 2,
                        //         mb: 1,
                        //         pl: 1.5,
                        //         position: 'relative',
                        //         bgcolor: isActive ? '#e3f2fd' : 'transparent',
                        //         boxShadow: isActive ? 2 : 0,
                        //         '&::before': isActive
                        //             ? {
                        //                 content: '""',
                        //                 position: 'absolute',
                        //                 left: 0,
                        //                 top: 0,
                        //                 bottom: 0,
                        //                 width: '4px',
                        //                 borderRadius: '4px 0 0 4px',
                        //                 backgroundColor: 'primary.main',
                        //             }
                        //             : {},
                        //         '&:hover': {
                        //             bgcolor: isActive ? '#e0f0ff' : '#f9f9f9',
                        //         },
                        //     }}
                        // >
                        //     <ListItemText
                        //         primary={form.Title}
                        //         primaryTypographyProps={{
                        //             fontSize: 12,
                        //             fontWeight: isActive ? 700 : 500,
                        //             color: isActive ? 'primary.main' : 'text.primary',
                        //         }}
                        //         secondary={
                        //             form.Status === 'Signed' && form.SignedDate
                        //                 ? `Signed on: ${new Date(form.SignedDate).toLocaleDateString()} ${new Date(form.SignedDate).toLocaleTimeString()}`
                        //                 : form.Status
                        //         }

                        //     />
                        //     <ListItemIcon>
                        //         {form.Status === 'Signed' ? (
                        //             <CheckCircleIcon color="success" fontSize="medium"  />
                        //         ) : (
                        //             <ScheduleIcon color="warning" fontSize="medium" />
                        //         )}
                        //     </ListItemIcon>
                        // </ListItemButton>

                        <ListItemButton
                            key={form.FormID}
                            selected={isActive}
                            onClick={() => onSelect(form)}
                            sx={{
                                borderRadius: 2,
                                mb: 1,
                                pl: 1.5,
                                position: 'relative',
                                bgcolor: isActive ? '#e3f2fd' : 'transparent',
                                boxShadow: isActive ? 2 : 0,
                                display: 'flex', // ADD
                                justifyContent: 'space-between', // ADD
                                alignItems: 'center', // ADD
                                '&::before': isActive
                                    ? {
                                        content: '""',
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: '4px',
                                        borderRadius: '4px 0 0 4px',
                                        backgroundColor: 'primary.main',
                                    }
                                    : {},
                                '&:hover': {
                                    bgcolor: isActive ? '#e0f0ff' : '#f9f9f9',
                                },
                            }}
                        >
                            {/* Text Section */}
                            <Box sx={{ flexGrow: 0 }}>
                                <ListItemText
                                    primary={form.Title}
                                    primaryTypographyProps={{
                                        fontSize: 12,
                                        fontWeight: isActive ? 700 : 500,
                                        color: isActive ? 'primary.main' : 'text.primary',
                                    }}
                                    secondary={
                                        form.Status === 'Signed' && form.SignedDate
                                            ? `Signed on: ${new Date(form.SignedDate).toLocaleDateString()} ${new Date(form.SignedDate).toLocaleTimeString()}`
                                            : form.Status
                                    }
                                    secondaryTypographyProps={{
                                        fontSize: 11,
                                        color: 'text.secondary',
                                        // whiteSpace: 'nowrap', // Ensures one-line
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                    
                                />
                            </Box>

                            {/* Icon Section */}
                            <Box sx={{ ml: 1 }}>
                                {form.Status === 'Signed' ? (
                                    <CheckCircleIcon color="success" fontSize="small"  />
                                ) : (
                                    <ScheduleIcon color="warning" fontSize="small" />
                                )}
                            </Box>
                        </ListItemButton>


                    );
                })}
            </List>
        </Box>
    );
};

export default ConsentFormList;
