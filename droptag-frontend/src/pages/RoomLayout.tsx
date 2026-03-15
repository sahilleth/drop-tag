import { Outlet, useParams, useNavigate, NavLink } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RoomHeader from "@/components/RoomHeader";
import RoomFooter from "@/components/RoomFooter";
import PinDialog from "@/components/PinDialog";
import RoomSettingsDialog from "@/components/RoomSettingsDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { getFilesForRoom } from "@/lib/files";
import { getTextsForRoom } from "@/lib/texts";
import { getClientId } from "@/lib/clientId";
import { isValidRoomName, type RoomRecord } from "@/lib/rooms";
import { addRecentRoom } from "@/lib/recentRooms";

export interface RoomOutletContext {
  normalizedHashtag: string;
  room: RoomRecord | null;
  isExpired: boolean;
  canManageRoom: boolean;
  clientId: string;
}

const RoomTabs = ({
  filesCount,
  textsCount,
}: {
  filesCount: number;
  textsCount: number;
}) => {
  const tabBaseClasses =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all";

  const inactiveClasses =
    "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground";
  const activeClasses = "border-primary bg-primary/10 text-primary";

  return (
    <div className="flex items-center gap-2 border-b border-border/60 pb-2">
      <NavLink
        to="files"
        end
        className={({ isActive }) =>
          `${tabBaseClasses} ${isActive ? activeClasses : inactiveClasses}`
        }
      >
        <span>Files</span>
        <span className="text-[10px] text-muted-foreground/80">({filesCount})</span>
      </NavLink>
      <NavLink
        to="text"
        className={({ isActive }) =>
          `${tabBaseClasses} ${isActive ? activeClasses : inactiveClasses}`
        }
      >
        <span>Text</span>
        <span className="text-[10px] text-muted-foreground/80">({textsCount})</span>
      </NavLink>
    </div>
  );
};

const RoomLayout = () => {
  const { hashtag } = useParams<{ hashtag: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const normalizedHashtag = useMemo(
    () => (hashtag || "demo").trim().replace(/^#/, ""),
    [hashtag],
  );

  const isRoomNameValid = isValidRoomName(normalizedHashtag);

  const filesQuery = useQuery({
    queryKey: ["room-files", normalizedHashtag],
    queryFn: () => getFilesForRoom(normalizedHashtag),
    enabled: Boolean(normalizedHashtag) && isRoomNameValid,
    refetchOnWindowFocus: true,
    staleTime: 15 * 1000,
  });

  const textsQuery = useQuery({
    queryKey: ["room-texts", normalizedHashtag],
    queryFn: () => getTextsForRoom(normalizedHashtag),
    enabled: Boolean(normalizedHashtag) && isRoomNameValid,
    refetchOnWindowFocus: true,
    staleTime: 15 * 1000,
  });

  const room = (filesQuery.data?.room as RoomRecord | null) ?? null;
  const isExpired = filesQuery.data?.isExpired ?? false;
  const filesCount = filesQuery.data?.files.length ?? 0;
  const textsCount = textsQuery.data?.texts.length ?? 0;
  const clientId = getClientId();

  const [pinVerified, setPinVerified] = useState(false);
  const [showSetPin, setShowSetPin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const canManageRoom = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      const flag = window.localStorage.getItem(`droptag:room-owner:${normalizedHashtag}`);
      return flag === "1";
    } catch {
      return false;
    }
  }, [normalizedHashtag]);

  useEffect(() => {
    if (isRoomNameValid) {
      addRecentRoom(normalizedHashtag);
    }
  }, [isRoomNameValid, normalizedHashtag]);

  if (!isRoomNameValid) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20 pb-16">
          <div className="container max-w-3xl mx-auto px-4 sm:px-6">
            <Alert variant="destructive" className="rounded-xl">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <AlertTitle>Invalid room name</AlertTitle>
              <AlertDescription>
                Room name must be 3–30 characters and can contain letters, numbers, - or _.
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button size="sm" className="rounded-md h-8 text-xs" onClick={() => navigate("/")}>
                Go back home
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (room?.secret_hash && !pinVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <PinDialog
          mode="verify"
          open
          hashtag={normalizedHashtag}
          roomId={room.id}
          onVerified={() => setPinVerified(true)}
        />
      </div>
    );
  }

  const outletContext: RoomOutletContext = {
    normalizedHashtag,
    room,
    isExpired,
    canManageRoom,
    clientId,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-16">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <header className="mb-4">
            <RoomHeader
              hashtag={normalizedHashtag}
              isExpired={isExpired}
              room={room}
              onSetPin={canManageRoom ? () => setShowSetPin(true) : undefined}
              onOpenSettings={canManageRoom ? () => setShowSettings(true) : undefined}
              onChangeExpiry={canManageRoom ? () => setShowSettings(true) : undefined}
            />
          </header>

          <RoomTabs filesCount={filesCount} textsCount={textsCount} />

          <div className="mt-6">
            <Outlet context={outletContext} />
            <RoomFooter />
          </div>
        </div>
      </main>
      <Footer />

      {room && canManageRoom && (
        <>
          <PinDialog
            mode="set"
            open={showSetPin}
            hashtag={normalizedHashtag}
            roomId={room.id}
            onVerified={() => setShowSetPin(false)}
            onClose={() => setShowSetPin(false)}
          />
          <RoomSettingsDialog
            room={room}
            open={showSettings}
            onClose={() => setShowSettings(false)}
            onUpdated={() => {
              void queryClient.invalidateQueries({ queryKey: ["room-files", normalizedHashtag] });
              void queryClient.invalidateQueries({ queryKey: ["room-texts", normalizedHashtag] });
            }}
          />
        </>
      )}
    </div>
  );
};

export default RoomLayout;

