import { useState } from "react";
import { View, Text, TextInput, Button, Alert, Picker } from "react-native";
import { signup } from "../utils/auth";
import { isValidEmail, isValidPassword } from "../utils/validation";
import { useRouter } from "expo-router";
import Loading from "../components/Loading";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [org, setOrg] = useState("org1");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!isValidEmail(email)) {
      return Alert.alert("Validation Error", "Please enter a valid email");
    }
    if (!isValidPassword(password)) {
      return Alert.alert("Validation Error", "Password must be at least 6 characters");
    }
    if (!role) {
      return Alert.alert("Validation Error", "Please select a role");
    }
    if (role === "member" && !org) {
      return Alert.alert("Validation Error", "Please select an organization");
    }

    setLoading(true);
    try {
      await signup(email, password, role, org);
      router.replace("/message");
    } catch (err) {
      Alert.alert("Signup failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Signup</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />

      <Text>Role:</Text>
      <Picker selectedValue={role} onValueChange={setRole}>
        <Picker.Item label="Member" value="member" />
        <Picker.Item label="Admin" value="admin" />
      </Picker>

      {role === "member" && (
        <>
          <Text>Org:</Text>
          <Picker selectedValue={org} onValueChange={setOrg}>
            <Picker.Item label="Org1" value="org1" />
            <Picker.Item label="Org2" value="org2" />
          </Picker>
        </>
      )}

      {loading ? (
        <Loading message="Creating account..." />
      ) : (
        <>
          <Button title="Signup" onPress={handleSignup} />
          <Button title="Go to Login" onPress={() => router.push("/login")} />
        </>
      )}
    </View>
  );
}
