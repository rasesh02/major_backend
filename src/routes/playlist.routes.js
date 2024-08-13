import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js"
const router=Router();
router.use(verifyJWT);
router.route("/").post(createPlaylist);
router.route("/users/:userId").get(getUserPlaylists);
router.route("/:playlistId")
      .get(getPlaylistById)
      .patch(updatePlaylist)
      .delete(deletePlaylist)
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);      
router.route("remove/:videoId/:playlistId").patch(removeVideoFromPlaylist)

export default router