import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card, { CardHead, CardBody } from '../../components/common/Card';
import { InlineLoader } from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { getRooms, updateRoom } from '../../api/admin.api';
import '../../styles/components.css';

const STATUS_OPTIONS = ['occupied', 'vacant', 'checkout'];

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getRooms().then(res => setRooms(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function handleUpdate() {
    if (!modal || !newStatus) return;
    setUpdating(true);
    try {
      await updateRoom(modal._id, { status: newStatus });
      setRooms(prev => prev.map(r => r._id === modal._id ? { ...r, status: newStatus } : r));
      setModal(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  }

  const statusBadgeType = (s) => s === 'occupied' ? 'in-progress' : s === 'checkout' ? 'paused' : 'completed';

  return (
    <Layout title="Rooms" subtitle="Hotel room status and management">
      {loading ? <InlineLoader /> : (
        <Card>
          <CardHead title="Room Overview" action={`${rooms.length} rooms`} />
          <CardBody flush>
            <div className="table-wrap">
              <table className="table table-stack">
                <thead>
                  <tr>
                    <th>Room No.</th>
                    <th>Type</th>
                    <th>Floor</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room, i) => (
                    <tr key={room._id} style={{ animation: `fadeInUp 0.35s ${i * 25}ms ease both` }}>
                      <td data-label="Room No." className="copy-strong">Room {room.roomNo}</td>
                      <td data-label="Type"><Badge type="gold">{room.roomType}</Badge></td>
                      <td data-label="Floor" className="copy-muted">Floor {room.floor}</td>
                      <td data-label="Status"><Badge type={statusBadgeType(room.status)}>{room.status}</Badge></td>
                      <td data-label="Action">
                        <Button variant="ghost" size="sm" onClick={() => { setModal(room); setNewStatus(room.status); }}>
                          Update Status
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {modal && (
        <Modal
          title={`Update Room ${modal.roomNo}`}
          onClose={() => setModal(null)}
          footer={(
            <>
              <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleUpdate} loading={updating}>Update</Button>
            </>
          )}
        >
          <div className="form-group">
            <label className="form-label">New Status</label>
            <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </Modal>
      )}
    </Layout>
  );
}
