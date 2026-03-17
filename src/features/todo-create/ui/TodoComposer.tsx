import { Button, Input } from 'antd'
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
      <Input
        id="todo-input"
        size="large"
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        placeholder="예: 장보기, 문서 정리, 운동 가기"
      />
      <Button
        type="primary"
        htmlType="submit"
        size="large"
        className="primary-button"
      >
        추가
      </Button>
    </form>
  )
}

export default TodoComposer
