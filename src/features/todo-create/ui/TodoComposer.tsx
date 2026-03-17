import type { FormEvent } from 'react'

type TodoComposerProps = {
  draft: string
  onDraftChange: (draft: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function TodoComposer({
  draft,
  onDraftChange,
  onSubmit,
}: TodoComposerProps) {
  return (
    <form className="composer" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="todo-input">
        새 작업
      </label>
      <input
        id="todo-input"
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        placeholder="예: 장보기, 문서 정리, 운동 가기"
      />
      <button type="submit" className="primary-button">
        추가
      </button>
    </form>
  )
}

export default TodoComposer
