import { IdeatorClient } from "@/components/features/ideator";
import { getChats } from "@/lib/actions/chats";

export default async function IdeatorPage() {
  const result = await getChats();
  const chats = result.success ? result.data : [];

  return <IdeatorClient initialChats={chats} />;
}
