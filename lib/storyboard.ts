export interface Scene {
  id: string;
  imageFile: File | null;
  prompt: string;
  aspectRatio: string;
  operationName: string | null;
  isGenerating: boolean;
  videoUrl: string | null;
  videoBlobRef: Blob | null;
  originalVideoUrlRef: string | null;
  trimmedBlobRef: Blob | null;
  trimmedUrlRef: string | null;
}

export interface SceneCreationData {
  imageFile: File | null;
  prompt: string;
  aspectRatio?: string;
}

export const createScene = (data: SceneCreationData): Scene => {
  return {
    id: crypto.randomUUID(),
    imageFile: data.imageFile,
    prompt: data.prompt,
    aspectRatio: data.aspectRatio || "16:9",
    operationName: null,
    isGenerating: false,
    videoUrl: null,
    videoBlobRef: null,
    originalVideoUrlRef: null,
    trimmedBlobRef: null,
    trimmedUrlRef: null,
  };
};

export const updateScene = (
  scenes: Scene[],
  sceneId: string,
  updates: Partial<Scene>
): Scene[] => {
  return scenes.map((scene) =>
    scene.id === sceneId ? { ...scene, ...updates } : scene
  );
};

export const removeScene = (scenes: Scene[], sceneId: string): Scene[] => {
  return scenes.filter((scene) => scene.id !== sceneId);
};

export const reorderScenes = (
  scenes: Scene[],
  fromIndex: number,
  toIndex: number
): Scene[] => {
  const result = [...scenes];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
};

export const cleanupSceneUrls = (scene: Scene): void => {
  if (scene.videoUrl && scene.videoBlobRef) {
    URL.revokeObjectURL(scene.videoUrl);
  }
  if (scene.originalVideoUrlRef) {
    URL.revokeObjectURL(scene.originalVideoUrlRef);
  }
  if (scene.trimmedUrlRef) {
    URL.revokeObjectURL(scene.trimmedUrlRef);
  }
};

export const cleanupAllSceneUrls = (scenes: Scene[]): void => {
  scenes.forEach(cleanupSceneUrls);
};