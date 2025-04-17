// Import React Hooks
import React, { useRef, useState, useEffect } from "react";
import { SafeAreaView, StyleSheet, Text, View, PermissionsAndroid, Platform } from "react-native";

// Import Agora SDK
import {
    createAgoraRtcEngine,
    ChannelProfileType,
    ClientRoleType,
    IRtcEngineEventHandler,
} from "react-native-agora";

// Define basic information
const appId = "4352c4373bc24ea0ba172e9596a59201"; // Replace with your Agora App ID
const token = "007eJxTYPgct6raR3el743coPlSWceuTT2cVLlabXHv6i8Km0/vnciiwGBibGqUbGJsbpyUbGSSmmiQlGhobpRqaWpplmhqaWRg2LnscXpDICND56YuJkYGCATxWRhKUotLGBgAtaohDw=="; // Replace with your Agora Token
const channelName = "test";
const localUid = 123; // Local user Uid, no need to modify

const AudioCall = () => {
    const agoraEngineRef = useRef(null); // Agora engine reference
    const [isJoined, setIsJoined] = useState(false); // State for tracking user in channel
    const [remoteUid, setRemoteUid] = useState(null); // State for remote user
    const [message, setMessage] = useState(""); // Message state

    useEffect(() => {
        const init = async () => {
            await setupVoiceSDKEngine();
        };
        init();
        return () => agoraEngineRef.current?.release(); // Cleanup on unmount
    }, []);

    const setupVoiceSDKEngine = async () => {
        try {
            if (Platform.OS === "android") {
                await getPermission();
            }
            agoraEngineRef.current = createAgoraRtcEngine();
            const agoraEngine = agoraEngineRef.current;
            agoraEngine.initialize({ appId });

            // Set event handlers
            agoraEngine.registerEventHandler({
                onJoinChannelSuccess: () => {
                    setMessage(`Joined channel: ${channelName}`);
                    setIsJoined(true);
                },
                onUserJoined: (_connection, uid) => {
                    setMessage(`Remote user ${uid} joined`);
                    setRemoteUid(uid);
                },
                onUserOffline: (_connection, uid) => {
                    setMessage(`Remote user ${uid} left`);
                    setRemoteUid(null);
                },
            });

            agoraEngine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
        } catch (error) {
            console.error("Agora Initialization Error:", error);
        }
    };

    const join = async () => {
        if (isJoined) return;
        
        if (!agoraEngineRef.current) {
            console.error("Agora engine is not initialized");
            return;
        }

        try {
            await agoraEngineRef.current?.joinChannel(token, channelName, localUid, {
                clientRoleType: ClientRoleType.ClientRoleBroadcaster,
            });
        } catch (error) {
            console.error("Join Channel Error:", error);
        }
    };

    const leave = () => {
        try {
            agoraEngineRef.current?.leaveChannel();
            setRemoteUid(null);
            setIsJoined(false);
            setMessage("Left the channel");
        } catch (error) {
            console.error("Leave Channel Error:", error);
        }
    };

    return (
        <SafeAreaView style={styles.main}>
            <Text style={styles.head}>Agora 1:1 Audio Call</Text>
            <View style={styles.btnContainer}>
                <Text onPress={join} style={styles.button}>
                    Join Channel
                </Text>
                <Text onPress={leave} style={styles.button}>
                    Leave Channel
                </Text>
            </View>
            {isJoined ? <Text>You joined</Text> : <Text>Join a channel</Text>}
            {isJoined && remoteUid ? <Text>User {remoteUid} joined</Text> : <Text>Waiting for remote user...</Text>}
            <View style={styles.messageContainer}>
                <Text style={styles.info}>{message}</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 25,
        paddingVertical: 10,
        fontWeight: "bold",
        color: "#fff",
        backgroundColor: "#0055cc",
        margin: 10,
        borderRadius: 5,
    },
    main: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    btnContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginVertical: 20,
    },
    head: {
        fontSize: 20,
        fontWeight: "bold",
    },
    messageContainer: {
        marginTop: 20,
    },
    info: {
        backgroundColor: "#ffffe0",
        padding: 10,
        color: "#0000ff",
        textAlign: "center",
        borderRadius: 5,
    },
});

const getPermission = async () => {
    if (Platform.OS === "android") {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    }
};

export default AudioCall;
