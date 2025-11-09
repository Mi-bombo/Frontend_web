type Props = {
  message?: string | null;
};

export function ResponseMessage({ message }: Props) {
  if (!message) return null;
  return (
    <div className="mt-4 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800">
      {message}
    </div>
  );
}
