const RoomFooter = () => {
  return (
    <div className="mt-10 mb-4 text-center text-xs text-muted-foreground">
      <p className="mb-1">
        <span className="mr-1">⚡</span>
        Powered by <span className="font-semibold">droptag</span>
      </p>
      <p>
        <a href="/" className="underline underline-offset-2 hover:text-foreground">
          Create your own room
        </a>
      </p>
    </div>
  );
};

export default RoomFooter;

