import React, {useEffect, useRef, useState,} from "react";

import {Animated, Dimensions, Keyboard, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
const { width } = Dimensions.get("window");

export interface SuggestionItem {
  id: string;
  title: string;
  subtitle?: string;
  data?: any;
}

interface Props {
  visible: boolean;
  data: SuggestionItem[];
  onSelect: (item: SuggestionItem) => void;
  onClose: () => void;
}

export default function SuggestionDropdown({
  visible,
  data,
  onSelect,
  onClose,
}: Props) {

  const fade =
    useRef(
      new Animated.Value(0)
    ).current;

  const scale =
    useRef(
      new Animated.Value(0.95)
    ).current;

  const [keyboardHeight,setKeyboardHeight]=
    useState(0);

  useEffect(()=>{

    const show=
      Keyboard.addListener(
        "keyboardDidShow",
        e=>{
          setKeyboardHeight(
            e.endCoordinates.height
          );
        }
      );

    const hide=
      Keyboard.addListener(
        "keyboardDidHide",
        ()=>{
          setKeyboardHeight(0);
        }
      );

    return ()=>{
      show.remove();
      hide.remove();
    };
  },[]);

  useEffect(()=>{

    if(visible){
      Animated.parallel([
        Animated.timing(fade,{
          toValue:1,
          duration:180,
          useNativeDriver:true,
        }),

        Animated.spring(scale,{
          toValue:1,
          friction:7,
          useNativeDriver:true,
        })
      ]).start();
    }else{
      fade.setValue(0);
      scale.setValue(.95);
    }
  },[visible]);
  if(!visible) return null;

  return (
    <>
        {/* Outside Overlay */}
        <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        />

        <Animated.View
        style={[
            styles.dropdown,
            {
            opacity: fade,
            transform: [{ scaleY: scale }],
            bottom: keyboardHeight + 20,
            },
        ]}
        >
        <ScrollView
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled
        >
            {data.map((item, index) => (
            <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                style={[
                styles.item,
                index === data.length - 1 && {
                    borderBottomWidth: 0,
                },
                ]}
                onPress={() => {
                console.log("Pressed", item.title);

                onSelect(item);

                onClose();
                }}
            >
                <View>
                <Text style={styles.title}>
                    {item.title}
                </Text>

                {!!item.subtitle && (
                    <Text style={styles.subtitle}>
                    {item.subtitle}
                    </Text>
                )}
                </View>
            </TouchableOpacity>
            ))}
        </ScrollView>
        </Animated.View>
        </>
    );
}

const styles = StyleSheet.create({

  dropdown:{
    position:"absolute",
    left:15,
    right:15,
    maxHeight:250,
    backgroundColor:"#fff",
    borderRadius:12,
    elevation:8,
    shadowColor:"#000",
    shadowOpacity:0.18,
    shadowRadius:8,
    shadowOffset:{
      width:0,
      height:4,
    },
    overflow:"hidden",
  },

  item:{
    paddingHorizontal:16,
    paddingVertical:14,
    borderBottomWidth:1,
    borderBottomColor:"#ECECEC",
  },

  title:{
    fontSize:16,
    color:"#222",
    fontWeight:"600",
  },

  subtitle:{
    marginTop:3,
    fontSize:13,
    color:"#777",
  },

  emptyContainer:{
    padding:20,
    alignItems:"center",
  },

  emptyText:{
    fontSize:15,
    color:"#999",
  },
});