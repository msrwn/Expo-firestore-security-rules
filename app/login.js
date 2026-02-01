import { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { login } from "../utils/auth";
import { isValidEmail, isNotEmpty } from "../utils/validation";
import { useRouter } from "expo-router";
import Loading from "../components/Loading";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("admin1@test.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    console.log("Attempting login with:", email, password)
    if (!isValidEmail(email)) {
      return Alert.alert("Validation Error", "Please enter a valid email");
    }
    if (!isNotEmpty(password)) {
      return Alert.alert("Validation Error", "Password cannot be empty");
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace("/message");
    } catch (err) {
      Alert.alert("Login failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginBottom: 20, padding: 10 }}
      />

      {loading ? (
        <Loading message="Logging in..." />
      ) : (
        <>
          <Button title="Login" onPress={handleLogin} />
          <Button title="Go to Signup" onPress={() => router.push("/signup")} />
        </>
      )}
    </View>
  );
}
