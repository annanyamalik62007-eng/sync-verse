import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import matchesRouter from "./matches";
import squadsRouter from "./squads";
import insightsRouter from "./insights";
import messagesRouter from "./messages";
import eventsRouter from "./events";
import campusRouter from "./campus";
import postsRouter from "./posts";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(matchesRouter);
router.use(squadsRouter);
router.use(insightsRouter);
router.use(messagesRouter);
router.use(eventsRouter);
router.use(campusRouter);
router.use(postsRouter);
router.use(aiRouter);

export default router;
