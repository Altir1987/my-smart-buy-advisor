import { useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import styles from './history.module.css';
import {AuthContext} from '/components/AuthGuard';

export default function History() {
   const [sessions, setSessions] = useState([]);
   const [error, setError] = useState('');
   const [modalSession, setModalSession] = useState(null);
   const router = useRouter();
   useEffect(() => {
      async function fetchHistory() {
         const res = await fetch('/api/history');
         if (res.ok) {
            const data = await res.json();
            setSessions(data.sessions);
         } else {
            setError('Unauthorized');
         }
      }
      fetchHistory();
   }, []);

   const deleteSession = async (sessionId) => {
      const confirmed = confirm('Delete session?');
      if (confirmed) {
         const res = await fetch('/api/delete-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
         });

         if (res.ok) {
            setSessions(prev => prev.filter(s => s.session_id !== sessionId));
            setModalSession(null);
         } else {
            alert('Something went wrong!');
         }
      }
   };

   return (
       <div className={styles.wrapper}>
          <h1 className={styles.title}>{sessions.length === 0 ? 'History Empty' : 'History Message'}</h1>
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {sessions.map((session) => {
             const firstUserMsg = session.messages.find(msg => msg.role === 'user');
             return (
                 <div onClick={() => setModalSession(session)}
                      key={session.session_id}
                      className={styles.messageWrapper}>
                    <div className={styles.date}>
                       {formatDistanceToNow(new Date(session.started_at), { addSuffix: true })}
                    </div>
                    <div
                        className={styles.shortPreview}
                    >
                       <strong className={styles.name}>
                          You
                       </strong>
                       <span className={styles.content}>
                        {firstUserMsg ? firstUserMsg.content : 'message empty'}
                     </span>
                    </div>
                 </div>
             )
          })}

          {modalSession && (
              <div className={styles.modalBackdrop} onClick={() => setModalSession(null)}>
                 <div className={styles.modalWindow} onClick={e => e.stopPropagation()}>
                    <div className={styles.modalTitle}>Full History</div>
                    <div className={styles.modalMessages}>
                       {modalSession.messages.map((msg, i) => (
                           <div key={i} className={styles.modalMsgItem}>
                              <div className={styles.modalMsgName}>
                                 {msg.role === 'user' ? 'You' : 'Assistant'}:
                              </div>
                              <div className={styles.modalMsgText}>{msg.content}</div>
                           </div>
                       ))}
                    </div>
                    <div className={styles.modalActions}>
                       <button
                           onClick={() => {
                              setModalSession(null);
                              router.push(`/chat?resume=${modalSession.session_id}`);
                           }}>
                          Продолжить
                       </button>
                       <button
                           onClick={() => deleteSession(modalSession.session_id)}>
                          Удалить
                       </button>
                       <button
                           onClick={() => setModalSession(null)}>
                          Закрыть
                       </button>
                    </div>
                 </div>
              </div>
          )}
       </div>
   );
}
