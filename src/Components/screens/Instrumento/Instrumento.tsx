import React, { useState, useEffect } from 'react';
import { Button, CircularProgress, Container, Typography, Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import Column from '../../../types/Column';
import Instrumento from '../../../types/Instrumento';
import InstrumentoService from '../../../service/InstrumentoService';
import TableComponent from '../../ui/TableComponent/TableComponent';
import ModalInstrumento from '../../ui/Modals/ModalInstrumento';
import { useAuth } from '../../../contexts/AuthContext';

const InstrumentoPage: React.FC = () => {
  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [instrumentoSeleccionado, setInstrumentoSeleccionado] = useState<Instrumento | null>(null);
  const [excelModalOpen, setExcelModalOpen] = useState<boolean>(false);
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  const { userRole } = useAuth();

  const instrumentoService = new InstrumentoService();
  const url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchInstrumentos = async () => {
      try {
        const data = await instrumentoService.getAll(url + '/instrumento');
        setInstrumentos(data);
      } catch (error) {
        console.error('Error al obtener los instrumentos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstrumentos();
  }, [instrumentoService, url]);

  const handleAgregarInstrumento = (instrumento: Instrumento | null) => {
    setModalOpen(true);
    if (instrumento) {
      setIsEditing(true);
      setInstrumentoSeleccionado(instrumento);
    } else {
      setIsEditing(false);
      setInstrumentoSeleccionado(null);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setIsEditing(false);
    setInstrumentoSeleccionado(null);
  };

  const handleDeleteInstrumento = async (instrumento: Instrumento) => {
    try {
      await instrumentoService.delete(url + '/instrumento', instrumento.id);
      setInstrumentos(instrumentos.filter((item) => item.id !== instrumento.id));
    } catch (error) {
      console.error('Error al eliminar el instrumento:', error);
    }
  };

  const handleGenerateExcel = async () => {
    try {
      const response = await fetch(`${url}/reporte/excel?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = `pedidos_${fechaDesde}_to_${fechaHasta}.xls`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error al generar el archivo Excel:', error);
    }
  };

  const columns: Column[] = [
    { id: 'imagen', label: 'Imagen', renderCell: (row) => <img src={row.imagen} alt="Instrumento" style={{ width: '50px', height: '50px', borderRadius: '10px' }} /> },
    { id: 'instrumento', label: 'Instrumento', renderCell: (row) => row.instrumento },
    { id: 'marca', label: 'Marca', renderCell: (row) => row.marca || '-' },
    { id: 'modelo', label: 'Modelo', renderCell: (row) => row.modelo || '-' },
    { id: 'precio', label: 'Precio', renderCell: (row) => `$${row.precio}` },
  ];

  return (
    <Container maxWidth="lg" sx={{ backgroundColor: '#d0f0c0', padding: '2rem', borderRadius: '8px' }}>
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Instrumentos
        </Typography>
        {userRole === 'ADMIN' && (
          <Button
            variant="contained"
            sx={{ backgroundColor: '#2E8B57', color: 'white', '&:hover': { backgroundColor: '#276a45' } }}
            onClick={() => handleAgregarInstrumento(null)}
          >
            Agregar Instrumento
          </Button>
        )}
        <Button
          variant="contained"
          sx={{ backgroundColor: '#2E8B57', color: 'white', '&:hover': { backgroundColor: '#276a45' }, marginLeft: '10px' }}
          onClick={() => setExcelModalOpen(true)}
        >
          Generar Excel de Pedidos
        </Button>
        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableComponent
            data={instrumentos}
            columns={columns}
            onEdit={handleAgregarInstrumento}
            onDelete={handleDeleteInstrumento}
          />
        )}
        <ModalInstrumento
          open={modalOpen}
          handleClose={handleCloseModal}
          isEditing={isEditing}
          instrumentoAEditar={instrumentoSeleccionado}
        />
        <Dialog open={excelModalOpen} onClose={() => setExcelModalOpen(false)}>
          <DialogTitle>Generar Excel de Pedidos</DialogTitle>
          <DialogContent>
            <TextField
              label="Fecha Desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              margin="normal"
            />
            <TextField
              label="Fecha Hasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExcelModalOpen(false)} color="secondary">Cancelar</Button>
            <Button
              onClick={handleGenerateExcel}
              sx={{ backgroundColor: '#2E8B57', color: 'white', '&:hover': { backgroundColor: '#276a45' } }}
            >
              Generar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default InstrumentoPage;
