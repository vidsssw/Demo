import React from "react";
import { convertToRaw, EditorState, AtomicBlockUtils } from "draft-js";
import { mediaBlockRenderer } from "./mediaBlockRenderer";
import Editor, { composeDecorators } from "draft-js-plugins-editor";
import createImagePlugin from "draft-js-image-plugin";
import createResizeablePlugin from "draft-js-resizeable-plugin";

import createAlignmentPlugin from "draft-js-alignment-plugin";
import createFocusPlugin from "draft-js-focus-plugin";
const resizeablePlugin = createResizeablePlugin();
const alignmentPlugin = createAlignmentPlugin();
const focusPlugin = createFocusPlugin();
const decorator = composeDecorators(
  resizeablePlugin.decorator,
  alignmentPlugin.decorator,
  focusPlugin.decorator
);
const imagePlugin = createImagePlugin({ decorator });

const { AlignmentTool } = alignmentPlugin;
const plugins = [imagePlugin, alignmentPlugin, resizeablePlugin];

export default class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = { editorState: EditorState.createEmpty() };
    this.onChange = (editorState) => this.setState({ editorState });
  }
  focus = () => {
    console.log("here", this.state.editorState);
    this.editor.focus();
  };

  render() {
    return (
      <div className="editorContainer">
        <div className="editors" onClick={this.focus}>
          <Editor
            editorState={this.state.editorState}
            onChange={this.onChange}
            plugins={plugins}
            ref={(element) => {
              this.editor = element;
            }}
          />

          <AlignmentTool />
        </div>
        <input type="file" onChange={this.handleClick} />
      </div>
    );
  }

  handleClick = async (event) => {
    const file = event.target.files[0];
    const size = event.target.files[0].size;
    const toBase64 = (file, type, size) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.onerror = (error) => reject(error);
      });

    const base64 = await toBase64(file, size);
    const newEditorState = this.insertImage(this.state.editorState, base64);
    console.log(newEditorState, "NEW");
    this.onChange(newEditorState);
  };

  insertImage = (editorState, base64) => {
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      "image",
      "IMMUTABLE",
      { src: base64 }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    });
    return AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, " ");
  };
}
