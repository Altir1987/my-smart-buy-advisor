import { useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import styles from './history.module.css';
import { useUser } from "/app/context/UseContext"
import IconSvgClose from "components/Icons/IconSvgClose"
import Skeleton from "@/components/skeleton/Skeleton";

export default function History() {
   const [sessions, setSessions] = useState([]);
   const [error, setError] = useState('');
   const [modalSession, setModalSession] = useState(null);
   const [confirmDeleteSessionId, setConfirmDeleteSessionId] = useState(null);
   const [loading, setLoading] = useState(true);
   const router = useRouter();
   const { user } = useUser();
   const renderWithLinks = (text) => {
      const urlRegex = /<?(https?:\/\/[^\s<>\"]+)>?/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = urlRegex.exec(text)) !== null) {
         if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
         }
         const url = match[1];
         parts.push(
             <a
                 key={url + match.index}
                 href={url}
                 target="_blank"
                 rel="noopener noreferrer"
                 className={styles.link}
             >
                {url}
             </a>
         );
         lastIndex = match.index + match[0].length;
      }
      if (lastIndex < text.length) {
         parts.push(text.substring(lastIndex));
      }
      return parts;
   }
   useEffect(() => {
      async function fetchHistory() {
         const res = await fetch('/api/history');
         if (res.ok) {
            const data = await res.json();
            setSessions(data.sessions);
         } else {
            setError('Unauthorized');
         }
         setLoading(false)
      }
      fetchHistory();
   }, []);
   const confirmDeleteSession = async () => {
      if (!confirmDeleteSessionId) return;
      const res = await fetch('/api/delete-session', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ sessionId: confirmDeleteSessionId }),
      });
      if (res.ok) {
         setSessions(prev => prev.filter(s => s.session_id !== confirmDeleteSessionId));
         setModalSession(null);
      } else {
         alert('Something went wrong!');
      }
      setConfirmDeleteSessionId(null);
   };

   return (
       <div className={styles.wrapper}>
          <h1 className={styles.title}>
             {loading
                 ? ''
                 : (sessions.length === 0 ? 'History Empty' : 'History Message')}
          </h1>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {loading && <Skeleton />}
          {!loading && sessions.map((session) => {
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
                       {user && (
                           <strong className={styles.name}>
                              {user.name}
                           </strong>
                       )}
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
                    <button className={styles.closeButton} type={"button"} onClick={() => setModalSession(null)}>
                       <IconSvgClose color='#4785F0'/>
                    </button>
                    <div className={styles.modalTitle}>Full History</div>
                    <div className={styles.modalMessages}>
                       {modalSession.messages.map((msg, i) => (
                           <div key={i} className={styles.modalMsgItem}>
                              <div className={styles.modalMsgName}>
                                 {msg.role === 'user' ? user.name : 'Assistant'}:
                              </div>
                              <div className={styles.modalMsgText}>{renderWithLinks(msg.content)}</div>
                           </div>
                       ))}
                    </div>
                    <div className={styles.modalActions}>
                       <button
                           onClick={() => {
                              setModalSession(null);
                              router.push(`/chat?resume=${modalSession.session_id}`);
                           }}>
                          Continue
                       </button>
                       <button
                           onClick={() => setConfirmDeleteSessionId(modalSession.session_id)}>
                          Delete
                       </button>
                    </div>
                    {confirmDeleteSessionId && (
                        <div className={styles.modalBackdrop} onClick={() => setConfirmDeleteSessionId(null)}>
                           <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
                              <div className={styles.confirmTitle}>Delete session?</div>
                              <div className={styles.confirmActions}>
                                 <button onClick={confirmDeleteSession}>Yes, delete</button>
                                 <button onClick={() => setConfirmDeleteSessionId(null)}>Cancel</button>
                              </div>
                           </div>
                        </div>
                    )}
                 </div>
              </div>
          )}
       </div>
   );
}
