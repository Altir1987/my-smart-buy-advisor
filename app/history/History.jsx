'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';

import styles from '@/app/history/history.module.css';
import { useUser } from '@/app/context/useContext';
import IconSvgClose from '@/components/Icons/IconSvgClose';
import Skeleton from '@/components/skeleton/Skeleton';
import { useHistory } from '@/app/hooks/useHistory';
import { renderWithLinks } from '@/app/utils/renderWithLinks';

export default function History() {
   const [modalSession, setModalSession] = useState(null);
   const [confirmDeleteSessionId, setConfirmDeleteSessionId] = useState(null);

   const router = useRouter();
   const { user } = useUser();

   const {
      sessions,
      error,
      loading,
      loadingMore,
      hasMore,
      fetchMore,
      deleteSession,
   } = useHistory();

   const sentinelRef = useRef(null);
   useEffect(() => {
      if (!sentinelRef.current) return;
      const obs = new IntersectionObserver(
          (e) => { if (e[0].isIntersecting) fetchMore(); },
          { rootMargin: '100px' }
      );
      obs.observe(sentinelRef.current);
      return () => obs.disconnect();
   }, [fetchMore]);

   const confirmDeleteSession = async () => {
      if (!confirmDeleteSessionId) return;
      await deleteSession(confirmDeleteSessionId);
      setConfirmDeleteSessionId(null);
      setModalSession(null);
   };
   return (
       <div className={styles.wrapper}>
          <h1 className={styles.title}>
             {loading ? '' : sessions.length === 0 ? 'History Empty' : 'History Message'}
          </h1>

          {error && <p style={{ color: 'red' }}>{error}</p>}
          {loading && <Skeleton />}

          {!loading && sessions.map((s) => {
             const firstUserMsg = s.messages.find(m => m.role === 'user');
             return (
                 <div key={s.session_id} className={styles.messageWrapper}
                      onClick={() => setModalSession(s)}>
                    <div className={styles.date}>
                       {formatDistanceToNow(new Date(s.started_at), { addSuffix: true })}
                    </div>
                    <div className={styles.shortPreview}>
                       {user && <strong className={styles.name}>{user.user.name}</strong>}
                       <span className={styles.content}>
                {firstUserMsg ? firstUserMsg.content : 'message empty'}
              </span>
                    </div>
                 </div>
             );
          })}

          <div ref={sentinelRef} />
          {loadingMore && <Skeleton />}
          {!hasMore && !loading && <p className={styles.end}>end history</p>}
          {modalSession && (
              <div className={styles.modalBackdrop} onClick={() => setModalSession(null)}>
                 <div className={styles.modalWindow} onClick={e => e.stopPropagation()}>
                    <button className={styles.closeButton} onClick={() => setModalSession(null)}>
                       <IconSvgClose color="#4785F0" />
                    </button>

                    <div className={styles.modalTitle}>Full History</div>
                    <div className={styles.modalMessages}>
                       {modalSession.messages.map((m, i) => (
                           <div key={i} className={styles.modalMsgItem}>
                              <div className={styles.modalMsgName}>
                                 {m.role === 'user' ? user.user.name : 'Assistant'}:
                              </div>
                              <div className={styles.modalMsgText}>
                                 {m.role === 'assistant'
                                     ? <ReactMarkdown>{m.content}</ReactMarkdown>
                                     : renderWithLinks(m.content, styles.link)}
                              </div>
                           </div>
                       ))}
                    </div>

                    <div className={styles.modalActions}>
                       <button onClick={() => {
                          setModalSession(null);
                          router.push(`/chat?resume=${modalSession.session_id}`);
                       }}>
                          Continue
                       </button>
                       <button onClick={() => setConfirmDeleteSessionId(modalSession.session_id)}>
                          Delete
                       </button>
                    </div>

                    {confirmDeleteSessionId && (
                        <div className={styles.modalBackdrop}
                             onClick={() => setConfirmDeleteSessionId(null)}>
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
