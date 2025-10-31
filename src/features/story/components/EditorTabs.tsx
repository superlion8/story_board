"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { ImageTab } from "@/features/story/components/ImageTab";
import { TransitionTab } from "@/features/story/components/TransitionTab";
import { PreviewTab } from "@/features/story/components/PreviewTab";
import { PropertiesTab } from "@/features/story/components/PropertiesTab";
import { useEditorStore } from "@/lib/store/editorStore";

const INITIAL_TAB: TabKey = "image";

type TabKey = "image" | "transition" | "preview" | "properties";

export function EditorTabs() {
  const [tab, setTab] = useState<TabKey>(INITIAL_TAB);
  const selectedTransitionId = useEditorStore((state) => state.selectedTransitionId);
  const selectedFrameId = useEditorStore((state) => state.selectedFrameId);

  // 自动切换 Tab
  useEffect(() => {
    if (selectedTransitionId) {
      setTab("transition");
    }
  }, [selectedTransitionId]);

  useEffect(() => {
    if (selectedFrameId && tab === "transition" && !selectedTransitionId) {
      setTab("image");
    }
  }, [selectedFrameId, tab, selectedTransitionId]);

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as TabKey)}>
      <TabsList>
        <TabsTrigger value="image">Image</TabsTrigger>
        <TabsTrigger value="transition">Transition</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="properties">Properties</TabsTrigger>
      </TabsList>
      <TabsContent value="image">
        <ImageTab />
      </TabsContent>
      <TabsContent value="transition">
        <TransitionTab />
      </TabsContent>
      <TabsContent value="preview">
        <PreviewTab />
      </TabsContent>
      <TabsContent value="properties">
        <PropertiesTab />
      </TabsContent>
    </Tabs>
  );
}
