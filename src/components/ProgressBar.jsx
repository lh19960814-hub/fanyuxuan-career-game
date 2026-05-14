export default function ProgressBar({ value }) {
  return (
    <div className="progress-bar" aria-label="经验进度">
      <div className="progress-bar__fill" style={{ width: `${value}%` }} />
    </div>
  );
}
