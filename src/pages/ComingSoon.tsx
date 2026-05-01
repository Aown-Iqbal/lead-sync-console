const ComingSoon = ({ title }: { title: string }) => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground">This feature is coming soon.</p>
    </div>
  </div>
);

export default ComingSoon;