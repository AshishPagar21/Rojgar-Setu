import React from "react";
import { Platform, TouchableOpacity, Text } from "react-native";
import {
  openBrowserAsync,
  WebBrowserPresentationStyle,
} from "expo-web-browser";

type Props = React.ComponentProps<typeof TouchableOpacity> & { href: string };

export function ExternalLink({ href, children, ...rest }: Props) {
  const handlePress = async (event?: any) => {
    if (Platform.OS === "web") return; // default anchor behavior on web
    // Prevent default navigation on native and open in in-app browser
    if (event?.preventDefault) event.preventDefault();
    await openBrowserAsync(href, {
      presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
    });
  };

  if (Platform.OS === "web") {
    return (
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      // Using native anchor lets devtools map the href and target correctly
      <a href={href} target="_blank" rel="noreferrer" {...(rest as any)}>
        {children ?? <Text style={{ color: "#1673ff" }}>{href}</Text>}
      </a>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} {...rest}>
      {children ?? <Text style={{ color: "#1673ff" }}>{href}</Text>}
    </TouchableOpacity>
  );
}
