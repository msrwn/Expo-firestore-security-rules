import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, Alert, ActivityIndicator, Picker } from "react-native";
import { auth, db } from "../firebase/firebaseConfig";
import { logout } from "../utils/auth";
import { sendMessage, getOrgMessage } from "../utils/firestore";
import { doc, getDoc } from "firebase/firestore";
import Loading from "../components/Loading";
import { isNotEmpty } from "../utils/validation";
import { useRouter } from "expo-router";

export default function Messages() {
  const [user, setUser] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, [])

  useEffect(() => {
    console.log("Fetching messages for org:", selectedOrg);
    fetchAllMessages();
  }, [selectedOrg]);

  const fetchUser = async () => {
    setLoadingUser(true);
    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUser(userData);
        setSelectedOrg(userData.role === "admin" ? "org1" : userData.org);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      Alert.alert("Error", "Failed to fetch user data");
    } finally {
      setLoadingUser(false);
    }
  };
  console.log("Selected Org:", selectedOrg);

  const fetchAllMessages = async () => {    
    setLoadingMessages(true);
    try {
      const msgsArray = await getOrgMessage(selectedOrg);
      setMessages(msgsArray);
    } catch (err) {
      console.error("Error fetching messages:", err);
      Alert.alert("Error", "Failed to fetch messages");
    } finally {
      setLoadingMessages(false);
    }   
  };

  const handleSend = async () => {
    if (!isNotEmpty(messageText)) {
      return Alert.alert("Validation Error", "Message cannot be empty");
    }
    if (!selectedOrg) {
      return Alert.alert("Validation Error", "Please select an organization");
    }
    if (user.role === "member" && selectedOrg !== user.org) {
      return Alert.alert("Error", "You can only send messages to your org");
    }

    setSending(true);
    try {
      await sendMessage(messageText, user.uid, user.role, selectedOrg);
      setMessageText("");
    } catch (err) {
      Alert.alert("Error", "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    router.replace("/login");
  };

  if (loadingUser) return <Loading message="Fetching user info..." />;


  if (user === null) { 
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 24, marginBottom: 10 }}>Messages</Text>
        <Text>You are not logged in.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>Messages</Text>

      {(user.role === "admin" || user.role === "member") && (
        <>
          <Text>Select Org:</Text>
          <Picker selectedValue={selectedOrg} onValueChange={(value) => { setSelectedOrg(value); setMessages([]); }}>
            <Picker.Item label="Org1" value="org1" />
            <Picker.Item label="Org2" value="org2" />
          </Picker>
        </>
      )}

      {loadingMessages ? (
        <Loading message="Loading messages..." />
      ) : (
        <FlatList
          style={{ flex: 1, marginVertical: 10 }}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ padding: 10, borderBottomWidth: 1 }}>
              <Text>{item.text} from {item.senderId} in the organiation of ({item.org}):</Text>
            </View>
          )}
        />
      )}

      <TextInput
        placeholder="Type your message"
        value={messageText}
        onChangeText={setMessageText}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        editable={!sending}
      />
      {sending ? (
        <Loading message="Sending messages..." />
      ) : (
        <Button title="Send" onPress={handleSend} />
      )}

      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
