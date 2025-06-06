'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function History() {
   const [sessions, setSessions] = useState([]);
   const [error, setError] = useState('');
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
      const confirmed = confirm('delete session?');
      if (confirmed) {
         const res = await fetch('/api/delete-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
         });

         if (res.ok) {
            setSessions(prev => prev.filter(s => s.session_id !== sessionId));
         } else {
            alert('Something went wrong');
         }
      }
   };

   return (
       <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
          <h1>{sessions.length === 0 ? 'Empty History' : 'Message History'}</h1>
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {sessions.map((session, index) => (
              <div key={index} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: 8 }}>
                 <h3>Сессия #{session.session_id}</h3>
                 <small>🕒 {new Date(session.started_at).toLocaleString()}</small>
                 <div style={{ marginTop: '1rem' }}>
                    {session.messages.map((msg, i) => (
                        <div
                            key={i}
                            style={{
                               background: msg.role === 'user' ? '#f0f8ff' : '#e6ffe6',
                               padding: '10px',
                               borderRadius: '6px',
                               marginBottom: '0.5rem'
                            }}
                        >
                           <strong>{msg.role === 'user' ? 'You' : 'Assistant'}:</strong>
                           <p>{msg.content}</p>
                           <small>{new Date(msg.created_at).toLocaleString()}</small>
                        </div>
                    ))}
                 </div>
                 <button
                     onClick={() => router.push(`/chat?resume=${session.session_id}`)}
                     style={{ marginTop: 10 }}
                 >
                    Продолжить
                 </button>
                 <button onClick={() => deleteSession(session.session_id)} style={{ marginTop: 10 }}>
                    Удалить
                 </button>
              </div>

          ))}
       </div>
   );
}
