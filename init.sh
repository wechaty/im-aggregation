echo "Creating downloads and output directory..."
mkdir downloads
mkdir output
echo "Done."

echo "Try to initialize the database..."
ts-node src/database/sync.ts
cp src/database/config.example.json src/database/config.json
echo "Done."

echo "Try to compile the voice converter."
yarn run compile:wx-voice
echo "Done."