import {
    Grid,
    Box,
    Avatar,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    CircularProgress,
    IconButton,
    Tooltip,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import JoinCircleModal from "../components/JoinCircleModal";
import RecipeThumbnail from "../components/RecipeThumbnail";
import FileCopyIcon from "@mui/icons-material/FileCopy";

interface CircleData {
    _id: string;
    name: string;
    description: string;
    profileUrl: string;
    owner: {
        _id: string;
        name: string;
        profileUrl: string;
    };
    members: {
        _id: string;
        name: string;
        profileUrl: string;
    }[];
    posts: {}[];
}

const CircleSelected = () => {
    const { id } = useParams<{ id: string }>();
    const [circleData, setCircleData] = useState<CircleData>({
        _id: "",
        name: "",
        description: "",
        profileUrl: "",
        owner: {
            _id: "",
            name: "",
            profileUrl: "",
        },
        members: [],
        posts: [{}],
    });
    const [loading, setLoading] = useState(true);
    const [isCopied, setIsCopied] = useState(false);
    const [joinCircleModalOpen, setJoinCircleModalOpen] = useState(false);

    const handleJoinCircleModalOpen = () => {
        setJoinCircleModalOpen(true);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/circles/${id}`, {
                    method: "GET",
                    credentials: "include",
                });
                console.log(response);

                if (response.ok) {
                    const { socialCircle } = await response.json();
                    setCircleData(socialCircle);
                    const response2 = await fetch(`/api/circles/${id}/posts`, {
                        method: "GET",
                        credentials: "include",
                    });
                    const { posts } = await response2.json();
                    setCircleData((prev) => ({
                        ...prev,
                        posts,
                    }));
                } else if (response.status === 401) {
                    handleJoinCircleModalOpen();
                }
            } catch (error) {
                console.log(error);
            }
            setLoading(false);
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Grid container spacing={4}>
                {/* Left Side of Page */}
                <Grid item xs={12} md={4}>
                    <Tooltip
                        title={
                            isCopied ? "Link copied!" : "Copy link to clipboard"
                        }
                    >
                        <IconButton onClick={handleCopyLink} size="large">
                            Invite
                            <FileCopyIcon />
                        </IconButton>
                    </Tooltip>
                    <Box
                        sx={{
                            padding: "20px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            marginBottom: "20px",
                        }}
                    >
                        <Avatar
                            src={circleData.profileUrl}
                            sx={{
                                width: "150px",
                                height: "150px",
                                marginBottom: "10px",
                            }}
                        />
                        <Typography variant="h5" gutterBottom>
                            {circleData.name}
                        </Typography>

                        <Typography variant="body1" gutterBottom>
                            {circleData.description}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Owner: {circleData.owner.name}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Members:
                        </Typography>
                        <List sx={{ width: "100%" }}>
                            {circleData.members.map((member) => (
                                <ListItem key={member._id}>
                                    <ListItemAvatar>
                                        <Avatar src={member.profileUrl} />
                                    </ListItemAvatar>
                                    <ListItemText primary={member.name} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Grid>

                {/* Right Side of Page */}
                <Grid item xs={12} md={8}>
                    <Box
                        sx={{
                            padding: "20px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            marginBottom: "20px",
                        }}
                    >
                        <Typography variant="h5" gutterBottom>
                            Posts
                        </Typography>
                        {
                            // if there are no posts, display a message
                            !circleData.posts ? (
                                <Typography variant="h6">
                                    No posts found
                                </Typography>
                            ) : (
                                <Grid container spacing={2}>
                                    {circleData.posts.slice(0).reverse().map((post: any) => (
                                        <Grid
                                            item
                                            xs={12}
                                            sm={6}
                                            md={4}
                                            lg={3}
                                            key={post.recipeId}
                                        >
                                            <RecipeThumbnail
                                                recipeThumbnail={
                                                    post.recipeThumbnail
                                                }
                                                message={{
                                                    message: post.message,
                                                    userInfo: post.userInfo,
                                                    timestamp: post.timestamp,
                                                }}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            )
                        }
                    </Box>
                </Grid>
            </Grid>
            <JoinCircleModal
                joinCircleModalOpen={joinCircleModalOpen}
                circleId={id!}
            />
        </>
    );
};

export default CircleSelected;
