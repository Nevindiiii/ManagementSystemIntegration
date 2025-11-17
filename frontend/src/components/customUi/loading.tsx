interface LoadingProps {
  message?: string;
}

export default function Loading({ message = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}
