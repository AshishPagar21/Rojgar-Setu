import { StyleSheet, Text, View } from "react-native";

export const ErrorMessage = ({ message }: { message?: string }) => {
  if (!message) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    backgroundColor: "#fef2f2",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  text: {
    color: "#b91c1c",
    fontSize: 14,
  },
});
