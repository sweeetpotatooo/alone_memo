import GitHubIcon from "@mui/icons-material/GitHub";
import LanguageIcon from "@mui/icons-material/Language";
import { Box, Container, Typography, IconButton } from "@mui/material";

export default function Footer() {
  return (
    <Box component="footer" sx={{
      py: 3,
      bgcolor: '#f5f5f5',
      borderTop: '1px solid #e0e0e0',
      position: 'fixed',
      left: 0,
      bottom: 0,
      width: '100%',
      zIndex: 1300
    }}>
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box textAlign="left">
            <Typography variant="body2" color="text.secondary">
              &copy; {new Date().getFullYear()} 나홀로 메모장
            </Typography>
          </Box>
          <Box textAlign="right">
            <IconButton
              component="a"
              href="https://github.com/sweeetpotatooo/alone_memo"
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              aria-label="GitHub"
            >
              <GitHubIcon />
            </IconButton>
            <IconButton
              component="a"
              href="https://www.notion.so/kimsehyun/alone-memo-notion"
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              aria-label="Notion"
            >
              <LanguageIcon />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
