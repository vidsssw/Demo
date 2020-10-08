import React from "react";
import { EditorState, AtomicBlockUtils } from "draft-js";

const addImage = (editorState, base64) => {
  const urlValue = window.prompt("Paste Image Link");
  const contentState = editorState.getCurrentContent();
  console.log("BASE", base64);
  const contentStateWithEntity = contentState.createEntity(
    "image",
    "IMMUTABLE",
    { src: urlValue }
  );
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const newEditorState = EditorState.set(
    editorState,
    { currentContent: contentStateWithEntity },
    "create-entity"
  );
  return AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, " ");
};

export default addImage;
