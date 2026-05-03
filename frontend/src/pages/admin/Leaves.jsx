import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card , { CardHead, CardBody } from "../../components/common/Card";
import { InlineLoader } from "../../components/common/Loader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { getPendingLeaves, updateLeave } from "../../api/leave.api";
import { getInitials, formatDate } from "../../utils/formatters";
import '../../styles/components.css';
import { NavLink } from "react-router-dom";


export default function AdminLeaves(){

    const [ leaves, setLeaves ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ processing, setProcessing ] = useState(null);


    useEffect(() => {
        fetchLeaves();
    },[]);


    async function fetchLeaves() {
        
        setLoading(true);

        try{
            const res = await getPendingLeaves();
            setLeaves(res.data);
        }

        catch(err){
            console.error(err);
        }

        finally{
            setLoading(false);
        }

    }


    async function handleLeave(id, status) {
        
        setProcessing(id + status); // shows spinner only on specific button

        try{
            await updateLeave(id, status);
            setLeaves(prev => prev.filter(l => l._id !== id));
        }
        
        catch(err){
            alert(err.response?.data?.message || 'Action failed');
        }

        finally{
            setProcessing(null);
        }
    }

  return (
    <Layout title="Leave Requests" subtitle="Review and approve staff leave applications">
      {loading ? <InlineLoader /> : (
        leaves.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📅</span>
            <p className="empty-text">No pending leave requests</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {leaves.map((leave, i) => (
              <Card key={leave._id} style={{ animationDelay: `${i * 50}ms` }}>
                <CardBody>
                  <div className="leave-request-row">
                    <div className="leave-request-info">
                      <div className="avatar avatar-lg">{getInitials(leave.staffId?.name)}</div>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '14px' }}>
                          {leave.staffId?.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                          📅 Leave on {formatDate(leave.leaveDate)}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                          {leave.reason}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                          Applied: {formatDate(leave.appliedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="leave-request-actions">
                      <Button
                        variant="success"
                        size="sm"
                        loading={processing === leave._id + 'approved'}
                        onClick={() => handleLeave(leave._id, 'approved')}
                      >
                        ✓ Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={processing === leave._id + 'rejected'}
                        onClick={() => handleLeave(leave._id, 'rejected')}
                      >
                        ✕ Reject
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )
      )}
    </Layout>
  );
}