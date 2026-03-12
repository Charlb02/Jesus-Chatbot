import React from 'react'
import content from './data/content.json'

function ChatBubble({ msg, userName, theme }) {
  const isUser = msg.sender === userName

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-start' : 'flex-end',
      }}
    >
      <div
        style={{
          maxWidth: '88%',
          background: isUser ? theme.userBubble : theme.botBubble,
          border: `1px solid ${theme.softBorder}`,
          borderRadius: 24,
          padding: '12px 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          whiteSpace: 'pre-line',
          lineHeight: 1.9,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>
          {msg.sender}
        </div>
        <div>{msg.text}</div>
      </div>
    </div>
  )
}

function ChipButton({ children, onClick, primary = false, accent }) {
  return (
    <button
      onClick={onClick}
      style={{
        borderRadius: 999,
        padding: '10px 16px',
        border: primary ? `1px solid ${accent}` : '1px solid #d1d5db',
        background: primary ? accent : '#ffffff',
        color: primary ? '#ffffff' : '#111827',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

export default function App() {
  const { meta, intro, actions, returnPath, topics } = content
  const theme = meta.theme
  const topicMap = React.useMemo(
    () => Object.fromEntries(topics.map((topic) => [topic.id, topic])),
    [topics]
  )
  const initialMessage = React.useMemo(
    () => ({ sender: meta.agentName, text: intro, type: 'intro' }),
    [meta.agentName, intro]
  )

  const [messages, setMessages] = React.useState([initialMessage])
  const [activeTopicId, setActiveTopicId] = React.useState(null)
  const scrollRef = React.useRef(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const pushMessage = React.useCallback((sender, text, type = 'normal') => {
    setMessages((prev) => [...prev, { sender, text, type }])
  }, [])

  const delayedBotMessage = React.useCallback(
    (text, type = 'answer', delay = 280) => {
      window.setTimeout(() => pushMessage(meta.agentName, text, type), delay)
    },
    [meta.agentName, pushMessage]
  )

  const chooseTopic = (topicId) => {
    const topic = topicMap[topicId]
    if (!topic) return

    setActiveTopicId(topicId)
    pushMessage(meta.userName, topic.title, 'choice')
    delayedBotMessage(`${topic.reply}\n\n${topic.verse}`)
  }

  const followUp = (kind) => {
    const topic = topicMap[activeTopicId]
    if (!topic) return

    pushMessage(meta.userName, actions[kind], 'choice')

    if (kind === 'step') delayedBotMessage(topic.step)
    if (kind === 'prayer') delayedBotMessage(topic.prayer)
    if (kind === 'verse') delayedBotMessage(topic.verse)
    if (kind === 'encouragement') delayedBotMessage(topic.encouragement)
  }

  const openReturnPath = () => {
    pushMessage(meta.userName, returnPath.userPrompt, 'choice')
    delayedBotMessage(returnPath.reply)
  }

  const resetChat = () => {
    setMessages([initialMessage])
    setActiveTopicId(null)
  }

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        background: theme.background,
        padding: 16,
      }}
    >
      <div
        style={{
          maxWidth: 1150,
          margin: '0 auto',
          display: 'grid',
          gap: 24,
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)',
        }}
      >
        <div
          style={{
            background: theme.card,
            borderRadius: 28,
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.10)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px 20px',
              borderBottom: `1px solid ${theme.softBorder}`,
              background: '#f9fafb',
              gap: 12,
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: 28 }}>{meta.title}</h1>
              <p style={{ margin: '6px 0 0', color: '#6b7280' }}>{meta.subtitle}</p>
            </div>
            <ChipButton onClick={resetChat} accent={theme.accent}>
              {actions.restart}
            </ChipButton>
          </div>

          <div
            ref={scrollRef}
            style={{
              height: '68vh',
              overflowY: 'auto',
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              background: 'linear-gradient(180deg, #f7faf9 0%, #ffffff 100%)',
            }}
          >
            {messages.map((msg, idx) => (
              <ChatBubble key={idx} msg={msg} userName={meta.userName} theme={theme} />
            ))}
          </div>

          <div style={{ padding: 16, borderTop: `1px solid ${theme.softBorder}` }}>
            {!activeTopicId ? (
              <>
                <div style={{ marginBottom: 12, color: '#4b5563', fontWeight: 700 }}>
                  {meta.introPromptLabel}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {topics.map((topic) => (
                    <ChipButton
                      key={topic.id}
                      onClick={() => chooseTopic(topic.id)}
                      accent={theme.accent}
                    >
                      {topic.title}
                    </ChipButton>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 12, color: '#4b5563', fontWeight: 700 }}>
                  {meta.followupLabel}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <ChipButton primary onClick={() => followUp('step')} accent={theme.accent}>
                    {actions.step}
                  </ChipButton>
                  <ChipButton onClick={() => followUp('prayer')} accent={theme.accent}>
                    {actions.prayer}
                  </ChipButton>
                  <ChipButton onClick={() => followUp('verse')} accent={theme.accent}>
                    {actions.verse}
                  </ChipButton>
                  <ChipButton onClick={() => followUp('encouragement')} accent={theme.accent}>
                    {actions.encouragement}
                  </ChipButton>
                  <ChipButton onClick={openReturnPath} accent={theme.accent}>
                    {actions.return}
                  </ChipButton>
                  <ChipButton onClick={() => setActiveTopicId(null)} accent={theme.accent}>
                    {actions.another}
                  </ChipButton>
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: 20,
              boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
            }}
          >
            <h2 style={{ marginTop: 0 }}>كيف تعدل المحتوى</h2>
            <div style={{ lineHeight: 1.9, color: '#374151' }}>
              <div>1) افتح الملف: <b>src/data/content.json</b></div>
              <div>2) عدّل الافتتاحية داخل <b>intro</b></div>
              <div>3) عدّل الأزرار داخل <b>actions</b></div>
              <div>4) أضف أو احذف موضوعًا داخل <b>topics</b></div>
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: 20,
              boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
            }}
          >
            <h2 style={{ marginTop: 0 }}>ما الذي يمكنك تغييره بسهولة؟</h2>
            <div style={{ lineHeight: 1.9, color: '#374151' }}>
              <div>• اسم المتكلم</div>
              <div>• نص البداية</div>
              <div>• عدد الأسباب</div>
              <div>• الردود والآيات والصلوات</div>
              <div>• ألوان الواجهة من theme</div>
            </div>
          </div>

          <div
            style={{
              background: '#ecfdf5',
              borderRadius: 24,
              padding: 20,
              border: '1px solid #a7f3d0',
              color: '#065f46',
            }}
          >
            <h2 style={{ marginTop: 0 }}>مناسب للنشر</h2>
            <div style={{ lineHeight: 1.9 }}>
              هذا المشروع جاهز كنقطة بداية لموقع صغير يمكن استضافته ثم ربطه برابط أو QR code.
              <div style={{ marginTop: 8 }}>{meta.footerNote}</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[dir="rtl"] > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
